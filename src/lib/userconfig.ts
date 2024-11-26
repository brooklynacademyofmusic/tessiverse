import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { env } from "$env/dynamic/private"
import { error } from "@sveltejs/kit"
import { tqGet } from "./tq";
import { hash } from "crypto";
import * as errors from "$lib/errors"

const key_vault_url = env.AZURE_KEY_VAULT_URL || "";
const admin_auth = env.TQ_ADMIN_LOGIN || "";
const tessi_api_url = env.TESSI_API_URL || "";

export class UserConfig {
    readonly identity: string = ""
    firstname: string = ""
    lastname: string = ""
    userid: string = ""
    inactive: boolean = false
    locked: boolean = false
    constituentid: number = -1
    group: string = ""
    tessiApiUrl: string = tessi_api_url
    location: string = ""
    apps: {
        planstep?: PlanStepConfig
    }

    constructor(identity: string) {
        this.identity = identity
        this.apps = {}
    }

    get auth() {
        return this.tessiApiUrl+"|"+this.userid+"|"+this.group+"|"+this.location
    }

    async loadFromTessi() {
        return tqGet(["users"],{"username":this.userid},admin_auth).
            then((tessi) => {
                Object.assign(this, tessi)
                return this
            }).catch(() => 
                error(500, errors.TQ)
            )
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

export class PlanStepConfig {
    steptypeid: number = 0
    closestep: boolean = true
}

