import { AppConfigurationClient } from "@azure/app-configuration";
import { DefaultAzureCredential } from "@azure/identity";
const azure_app_config_url = process.env.AZURE_APP_CONFIG_URL;

interface UserConfig {
    firstname: string
    lastname: string
    userid: string
    inactive: boolean
    locked: boolean
    constituentid: number
    auth: string
    apps: {
        planstep?: PlanStepConfig
    }
}

interface PlanStepConfig {
    steptypeid: number
    closestep: boolean
}

export async function readConfig(identity: string): Promise<UserConfig>{
    const client = new AppConfigurationClient(
        azure_app_config_url,
        new DefaultAzureCredential()
    )
    return client.getConfigurationSetting({
        "key": ["users",identity].join(".")
    }).then((response) => {
        return JSON.parse(response.value)
    })
}