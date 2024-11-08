import { AppConfigurationClient } from "@azure/app-configuration";
import { DefaultAzureCredential } from "@azure/identity";
import { tqGet } from "./http";
const azure_app_config_url = process.env.AZURE_APP_CONFIG_URL;
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
        const client = new AppConfigurationClient(
            azure_app_config_url,
            new DefaultAzureCredential()
        )
        return client.getConfigurationSetting({
            "key": ["users",this.identity].join(".")
        }).then((response) => {
            Object.assign(this,JSON.parse(response.value))
            return this
        })
    }

    async saveToAzure() {
        const client = new AppConfigurationClient(
            azure_app_config_url,
            new DefaultAzureCredential()
        )
        return client.setConfigurationSetting({
            "key": ["users",this.identity].join("."),
            "value": JSON.stringify(this)
        }).then(() => this)
    }
}

export class PlanStepConfig {
    steptypeid: number = 0
    closestep: boolean = true
}

