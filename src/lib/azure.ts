import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { error } from "@sveltejs/kit"
import crypto from "crypto";
import * as errors from "$lib/errors"
import { User } from "$lib/user"
import * as server from "$lib/config.server";
import * as config from "$lib/config";
import type { Serializable } from "$lib/apps";

type ValidAppNames = keyof config.Apps
type ValidBackendKey<A extends ValidAppNames>  = {identity: string, app: A}
type ValidBackendKeys = ValidBackendKey<ValidAppNames>
type ValidApp<K extends ValidBackendKeys> =  K extends ValidBackendKey<infer A> ? config.Apps[A] : never

export type BackendKey = {identity: string, app?: string} 
export interface Backend<T> {
    load(key: BackendKey): Promise<T> | T
    save(key: BackendKey, data: T): void
}

export class Azure implements Backend<User> {
    client: SecretClient 
    constructor() {
        this.client = new SecretClient(
            (server.key_vault_url.startsWith("https") ? "" : "https://") + server.key_vault_url,
            new DefaultAzureCredential()
        )
    }

    hash(s: string): string {
        return crypto.createHash("md5").update(["users",s].join(".")).digest("hex").toString()
    }

    async load(key: BackendKey): Promise<UserLoaded>  {
        return this.client.getSecret(this.hash(key.identity))
        .then((response) => {
            if (response.properties?.tags?.identity != key.identity) {
                error(500, {message: "Hash collision PANIC!"})
            }
            return JSON.parse(response.value || "") as UserLoaded
        }).catch((e) => {
            console.log(e)
            if (e.code === "SecretNotFound")
                error(404, errors.USER_NOT_FOUND)
            if (e.body?.message)
                error(500, e.body)
            error(500, errors.AZURE_KEYVAULT)
        })
    }

    async save(key: BackendKey, data: User): Promise<void> {
        let user = await this.load({identity: key.identity})
        Object.assign(user, data)
        return this.client.setSecret(this.hash(key.identity),
            JSON.stringify(user),            
            { tags: {identity: key.identity} }
        ).then(() => {}).catch(() => 
            error(500, errors.AZURE_KEYVAULT)
        )
    }
}

export class UserLoaded extends User implements Backend<ValidApp<ValidBackendKeys>> {
    load<K extends ValidBackendKeys>(key: K): ValidApp<K> {
        return this.apps[key.app] as ValidApp<K>
    }

    save<K extends ValidBackendKeys>(key: K, data: Serializable<ValidApp<K>>): Promise<void> {
        if (key.app && key.app in this.apps) {
            Object.assign(this.apps[key.app],data)
        } else {
            Object.assign(this,data)
        }
        let backend = new Azure()
        return backend.save(key, this)
    }

}