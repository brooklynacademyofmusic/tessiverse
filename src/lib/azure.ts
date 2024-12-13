import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { error } from "@sveltejs/kit"
import crypto from "crypto";
import { User } from "$lib/user"
import * as errors from "$lib/errors"
import { env } from '$env/dynamic/private'

export const key_vault_url = env.AZURE_KEY_VAULT_URL || "";

type Model = object
export type BackendKey<M extends Model> = M extends User ? {identity: string} : {identity: string, app: string} 
export interface Backend<M extends Model> {
    load(key: BackendKey<M>, target: M): Promise<M>
    save(key: BackendKey<M>, data: Partial<M>): void
}
//Typescript magic!
function hasProperty<O extends object>(o: O, k: PropertyKey): k is keyof O {
    return k in o
}


export class Azure implements Backend<Model> {
    client: SecretClient 
    constructor() {
        this.client = new SecretClient(
            key_vault_url,
            new DefaultAzureCredential()
        )
    }

    async load<M extends Model>(key: BackendKey<M>, target: M): Promise<M> {
        return this.client.getSecret(
            crypto.hash("md5",["users",key.identity].join("."))
        ).then((response) => {
            // console.log(JSON.stringify(response.value))
            if (response.properties?.tags?.identity != key.identity) {
                error(500, {message: "Hash collision PANIC!"})
            }
            let user: User = JSON.parse(response.value || "")
            if ("app" in key && hasProperty(user.apps, key.app)) {
                return Object.assign(target,user.apps[key.app])
            } else {
                return Object.assign(target,user)
            }    
        }).catch((e) => {
            console.log(e)
            if (e.code === "SecretNotFound")
                error(404, errors.USER_NOT_FOUND)
            if (e.body.message)
                error(500, e.body)
            error(500, errors.AZURE_KEYVAULT)
        })
    }

    async save<M extends Model>(key: BackendKey<M>, data: Partial<M>): Promise<void> {
        var user: User = new User(key.identity)
        if ("app" in key && hasProperty(user.apps, key.app)) {
            user = await this.load({identity: key.identity}, user)
            Object.assign(user.apps[key.app], data)
        } else {
            Object.assign(user, data)
        } 
        return this.client.setSecret(
            crypto.hash("md5",["users",key.identity].join(".")),
            JSON.stringify(user),            
            { tags: {identity: key.identity} }
        ).then(() => {}).catch(() => 
            error(500, errors.AZURE_KEYVAULT)
        )
    }
}