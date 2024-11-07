import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AppConfigurationClient } from "@azure/app-configuration";
import { DefaultAzureCredential } from "@azure/identity";

import axios from "axios";
import * as path from "path";

const tq_api_url = process.env.TQ_API_URL;
const azure_app_config_url = process.env.AZURE_APP_CONFIG_URL;

export async function planStep(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`planStep function processed request for url "${request.url}"`);
    const client = new AppConfigurationClient(
        azure_app_config_url,
        new DefaultAzureCredential()
    )
    const identity = "identity";
    try {
    var config = await client.getConfigurationSetting({
        "key": ["planStep",identity].join(".")
    })
    } catch(err: any) {
        console.log(err)
        return { status: 400}
    }
    
    const userid = config.value.userid;
    
    var resp = await axios.get(path.join(tq_api_url,"constituents/constituent"), { "params" : {"constituentid":"1"} })

    return { jsonBody: resp.data };
};

app.http('emailToTessi', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: planStep
});
