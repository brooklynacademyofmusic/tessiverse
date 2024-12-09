import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { error } from "@sveltejs/kit"
import { hash } from "crypto";
import { User } from "$lib/user"
import * as errors from "$lib/errors"
import { key_vault_url } from "$lib/config";
import type { App, Apps, AppNames } from '$lib/apps'

type Model = User | App

export type BackendKey<M extends Model> = M extends Apps ? {identity: string, app: AppNames} : {identity: string}
export interface Backend<M extends Model> {
    load(key: BackendKey<M>): Promise<M>
    save(key: BackendKey<M>, data: M): void
}

export class Azure implements Backend<Model> {
    client: SecretClient 
    constructor() {
        this.client = new SecretClient(
            key_vault_url,
            new DefaultAzureCredential()
        )
    }

    async load<M extends Model>(key: BackendKey<M>): Promise<M> {
        return this.client.getSecret(
            hash("md5",["users",key.identity].join("."))
        ).then((response) => {
            if (response.properties?.tags?.identity != key.identity) {
                throw new Error("Hash collision PANIC!")
            }
            let user: User = JSON.parse(response.value || "")
            if ("app" in key) {
                return user.apps[key.app]
            } else {
                return user
            }    
        }).catch((e) => {
            if (e.code === "SecretNotFound") {
                error(404, errors.USER_NOT_FOUND)
            }
            console.log(e)
            error(500, errors.AZURE_KEYVAULT)
        }) as Promise<M>
    }

    async save<M extends Model>(key: BackendKey<M>, data: M) {
        var user: User = new User(key.identity)
        if ("app" in key) {
            user = await this.load({identity: key.identity})
            ;(user.apps[key.app] as M) = data 
        } else {
            Object.assign(user, data)
        } 
        return this.client.setSecret(
            hash("md5",["users",key.identity].join(".")),
            JSON.stringify(user),            
            { tags: {identity: key.identity} }
        ).then(() => this).catch(() => 
            error(500, errors.AZURE_KEYVAULT)
        )
    }
}