import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { error } from "@sveltejs/kit"
import { hash } from "crypto";
import * as errors from "$lib/errors"
import { apps, type App } from "$lib/config"
import { key_vault_url } from "$lib/config";

export class User {
    readonly identity: string = ""
    apps = apps

    constructor(identity: string) {
        this.identity = identity
    }

    async load() {
        const client = new SecretClient(
            key_vault_url,
            new DefaultAzureCredential()
        )
        return client.getSecret(
            hash("md5",["users",this.identity].join("."))
        ).then((response) => {
            if (response.properties?.tags?.identity != this.identity) {
                throw new Error("Hash collision PANIC!")
            }
            Object.assign(this,JSON.parse(response.value || ""))
            return this
        }).catch((e) => {
            if (e.code === "SecretNotFound") {
                error(404, errors.USER_NOT_FOUND)
            }
            console.log(e)
            error(500, errors.AZURE_KEYVAULT)
        })
    }

    async save() {
        const client = new SecretClient(
            key_vault_url,
            new DefaultAzureCredential()
        )
        return client.setSecret(
            hash("md5",["users",this.identity].join(".")),
            JSON.stringify(this),
            {tags: {identity: this.identity} }
        ).then(() => this).catch(() => 
            error(500, errors.AZURE_KEYVAULT)
        )
    }

}


