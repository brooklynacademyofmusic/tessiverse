import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { error } from "@sveltejs/kit"
import crypto from "crypto";
import * as errors from "$lib/errors"
import { env } from '$env/dynamic/private'
import { type User } from "$lib/user"

export const key_vault_url = env.AZURE_KEY_VAULT_URL || "";
//Typescript magic!
function hasProperty<O extends object>(o: O, k: PropertyKey): k is keyof O {
    return k in o
}
export type BackendKey = {identity: string, app?: string} 
export interface Backend {
    load(key: BackendKey): Promise<any>
    save(key: BackendKey, data: any): void
}

export class Azure implements Backend {
    client: SecretClient 
    constructor() {
        this.client = new SecretClient(
            key_vault_url,
            new DefaultAzureCredential()
        )
    }

    async load(key: BackendKey): Promise<any>  {
        return this.client.getSecret(
            crypto.hash("md5",["users",key.identity].join("."))
        ).then((response) => {
            // console.log(JSON.stringify(response.value))
            if (response.properties?.tags?.identity != key.identity) {
                error(500, {message: "Hash collision PANIC!"})
            }
            let user: User = JSON.parse(response.value || "")
            if (key.app && hasProperty(user.apps, key.app)) {
                return user.apps[key.app]
            } else {
                return user
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

    async save(key: BackendKey, data: any): Promise<void> {
        let user = await this.load({identity: key.identity}) 
        if (key.app && hasProperty(user.apps, key.app)) {
            user = await this.load({identity: key.identity})
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