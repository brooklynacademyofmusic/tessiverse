import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { error } from "@sveltejs/kit"
import crypto from "node:crypto";
import * as errors from "$lib/errors"
import { User, type UserData } from "$lib/user"
import * as server from "$lib/config.server";
import * as config from "$lib/config";

type ValidAppNames = keyof config.Apps
type ValidBackendKey<A extends ValidAppNames>  = {identity: string, app: A}
export type ValidBackendKeys = ValidBackendKey<ValidAppNames>
type ValidAppData<K extends ValidBackendKeys> =  K extends ValidBackendKey<infer A> ? config.Apps[A]["data"] : never

export type BackendKey = {identity: string, app?: string} 
export interface Backend<T> {
    load(key: BackendKey): Promise<T> | T
    save(key: BackendKey, data: T): void
}

export class Azure implements Backend<UserData> {
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

    // Load only returns data and does not rehydrate
    async load(key: BackendKey): Promise<UserData>  {
        return this.client.getSecret(this.hash(key.identity))
        .then((response) => {
            if (response.properties?.tags?.identity != key.identity) {
                error(500, {message: "Hash collision PANIC!"})
            }
            return JSON.parse(response.value || "{}")
        }).catch((e) => {
            console.log(e)
            if (e.code === "SecretNotFound")
                error(404, errors.USER_NOT_FOUND)
            if (e.body?.message)
                error(500, e.body)
            error(500, errors.AZURE_KEYVAULT)
        })
    }

    // Save is destructive and overwrites the existing data
    async save(key: BackendKey, data: UserData): Promise<void> {
        return this.client.setSecret(this.hash(key.identity),
            JSON.stringify(data),            
            { tags: {identity: key.identity} }
        ).then(() => {}).catch(() => 
            error(500, errors.AZURE_KEYVAULT)
        )
    }
}

export class UserLoaded extends User implements Backend<ValidAppData<ValidBackendKeys>> {
    load<K extends ValidBackendKeys>(key: K): ValidAppData<K> {
        return this.apps[key.app] as any
    }

    save<K extends ValidBackendKeys>(key: K, data: ValidAppData<K>): Promise<void> {
        if (key.app && key.app in this.apps) {
            this.apps[key.app] = data as any
        } 
        let backend = new Azure()
        return backend.save(key, this)
    }

}