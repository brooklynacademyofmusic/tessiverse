import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { env } from "$env/dynamic/private"
import { error } from "@sveltejs/kit"
import { tq } from "./tq";
import { hash } from "crypto";
import * as errors from "$lib/errors"
import type { TessituraConfig } from "./apps/tessitura/tessitura.schema";

const key_vault_url = env.AZURE_KEY_VAULT_URL || "";
const admin_auth = env.TQ_ADMIN_LOGIN || "";
const tessi_api_url = env.TESSI_API_URL || "";


export class UserConfig {
    readonly identity: string = ""
    apps: Record<string, TessituraConfig> = {}

    constructor(identity: string) {
        this.identity = identity
        this.apps = {}
    }

    async loadFromAzure() {
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

    async saveToAzure() {
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


