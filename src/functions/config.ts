import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { tqGet } from "./http";
import { hash } from "crypto";
const key_vault_url = process.env.AZURE_KEY_VAULT_URL;
const admin_auth = process.env.TQ_ADMIN_LOGIN;
const tessi_api_url = process.env.TESSI_API_URL || "";

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
            })
    }

    async loadFromAzure() {
        const client = new SecretClient(
            key_vault_url,
            new DefaultAzureCredential()
        )
        return client.getSecret(
            hash("md5",["users",this.identity].join("."))
        ).then((response) => {
            if (response.properties.tags.identity != this.identity) {
                throw new Error("Hash collision PANIC!")
            }
            Object.assign(this,JSON.parse(response.value))
            return this
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
        ).then(() => this)
    }
}

export class PlanStepConfig {
    steptypeid: number = 0
    closestep: boolean = true
}

