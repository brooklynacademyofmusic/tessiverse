import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from 'axios';
const baseUrl = "https://agreeable-sky-09447c91e-preview.westus2.4.azurestaticapps.net/"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
import { planStep } from "../../../src/lib/apps/planStep/planStep.server"

export async function http(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    let url = new URL([request.params.path1, request.params.path2].join("/"),baseUrl).toString()
    console.log(planStep)
    let response = await axios<ArrayBuffer>({
        method: request.method,
        url: url,
        // data: request.body,
        // headers: Object.fromEntries(request.headers.entries())
    })

    return { 
        body: response.data,
        // headers: Object.fromEntries(Object.entries(response.headers).map(([k,v]) => [k,v]))
     };
};

app.http('httpTrigger', {
    methods: ['GET', 'PUT', 'POST'],
    authLevel: 'anonymous',
    handler: http,
    route: "tessiverse/{path1:alpha?}/{path2:alpha?}"
});
