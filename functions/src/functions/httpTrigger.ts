import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { planStep } from "../../../src/lib/apps/planStep/planStep.server"

export async function httpTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    console.log(planStep)
    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
};

app.http('httpTrigger', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger
});
