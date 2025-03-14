// forked (and radically modified) from https://github.com/Azure/azure-relay/blob/master/samples/hybrid-connections/node/rolebasedaccesscontrol/hyco-https/listener.js
import https from 'hyco-https';
import { DefaultAzureCredential } from "@azure/identity";
import axios from 'axios';
export const relay_aad_audience = "https://relay.azure.net//.default"; // this constant is the url of Azure Relay as a resource provider to authorize the token against.
// update token asynchronously every 10 minutes
let token = "";
function getToken() { return token; }
async function getTokenAsync() { setTimeout(getTokenAsync, 1000 * 60 * 10); token = (await new DefaultAzureCredential().getToken(relay_aad_audience)).token; }
await getTokenAsync();
export async function createListener(namespace, relay, server) {
    var listenUri = https.createRelayListenUri(namespace, relay);
    var listener = https.createRelayedServer({
        server: listenUri,
        token: getToken
    }, async (relayReq, relayRes) => {
        console.log('request accepted: ' + relayReq.method + ' on ' + relayReq.url);
        console.log('- headers: ' + JSON.stringify(relayReq.headers));
        let relativePath = (relayReq.url || "").replace(new RegExp(`/*${relay}/*`), "");
        let relativeUrl = `${server.replace(/\/$/, "")}/${relativePath}`;
        // stream the request to the local server
        await axios({
            method: relayReq.method,
            url: relativeUrl.toString(),
            headers: Object.fromEntries(Object.entries(relayReq.headers).filter(([key]) => !key.match(forbiddenHeaders))),
            data: relayReq,
            responseType: "arraybuffer"
        })
            // relay the server response back the requester
            .then((axiosRes) => axiosToServerResponse(axiosRes, relayRes))
            // error handling
            .catch((error) => {
            let message = "";
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                return axiosToServerResponse(error.response, relayRes);
            }
            else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.cause);
                message = JSON.stringify(error.cause) || error.message || "No response received";
            }
            else {
                // Something happened in setting up the request that triggered an Error
                console.log(error);
                message = error.message;
            }
            relayRes.statusCode = 500;
            relayRes.write(message);
        })
            // whew!
            .finally(() => relayRes.end());
    });
    listener.on('error', (err) => {
        if (err.message.includes("401")) {
            console.error("Invalid login token, did you forget to provide credentials?");
        }
        console.error(err.message);
    });
    // promise for waiting until server is listening and to fail on error
    return new Promise((res) => {
        listener.on('listening', () => {
            console.log(`server is listening to ${listener.listenUri}`);
            res(listener);
        });
        listener.listen();
    });
}
// pass response from axios back to the relay
function axiosToServerResponse(incoming, outgoing) {
    outgoing.statusCode = incoming.status;
    if (incoming.headers)
        Object.entries(incoming.headers)
            .filter(([key]) => !key.match(forbiddenHeaders))
            .map(([key, val]) => outgoing.setHeader(key, val));
    outgoing.write(incoming.data);
}
const forbiddenHeaders = new RegExp("^(Accept-Encoding|Access-Control-Request-Headers|Access-Control-Request-Method|Connection|Content-Length|" +
    "Cookie|Date|DNT|Expect|Host|Keep-Alive|Origin|Permissions-Policy|Proxy-.+|Sec-.+|Referer|TE|Trailer|Transfer-Encoding|Upgrade|Via)$", "i");
//# sourceMappingURL=listener.js.map