import { test, expect, describe, afterEach, beforeAll, afterAll } from "vitest";
import http from "http";
import https from "https";
import axios from "axios";
import { createListener, relay_aad_audience } from "./listener";
import * as identity from '@azure/identity';
import { readFileSync } from "fs";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var request;
const certs = {
    key: readFileSync('relay/dev-server.key'), // openssl genrsa -out dev-server.key 2048  
    cert: readFileSync('relay/dev-server.crt') // openssl x509 -new -key dev-server.key -days 365 -out dev-server.crt -subj /CN=localhost/
};
const axiosInstance = axios.create({
    headers: { 'ServiceBusAuthorization': (await new identity.DefaultAzureCredential().getToken(relay_aad_audience)).token }
});
function endpointServer(port, endpointRes) {
    let server = http.createServer(async (_req, _res) => {
        request = _req;
        _req.setEncoding("utf8");
        request.data = "";
        await new Promise((res) => _req.on("data", (data) => request.data += data).on("close", () => res(true)));
        _res.setHeader("content-type", "application/json");
        _res.setHeader("endpoint", "this is an endpoint header");
        _res.write(endpointRes);
        _res.end();
    });
    return new Promise((resolve, reject) => {
        server.on("listening", () => resolve(server));
        server.on("error", (e) => reject(e));
        server.listen(port);
    });
}
describe("listener with http endpoint", async () => {
    let relay;
    let server = "tessiverse-test.servicebus.windows.net";
    let path = "test-relay";
    let endpoint;
    let serverURI = new URL("http://localhost");
    let relayURI = "https://" + server + "/" + path;
    let serverPort = 3000;
    serverURI.port = `${serverPort}`;
    beforeAll(async () => {
        relay = await createListener(server, path, serverURI.toString());
    });
    afterAll(async () => {
        relay.close(() => { });
    });
    afterEach(() => {
        endpoint.close();
    });
    test("listener is transparent to http GET from client => endpoint and endpoint => client", async () => {
        let endpointBody = "I'm an endpoint";
        endpoint = await endpointServer(serverPort, endpointBody);
        let response = await axiosInstance.get(relayURI);
        expect(request.method).toBe("GET");
        expect(request.url).toBe("/");
        expect(response.data).toBe("I'm an endpoint");
    });
    test("listener is transparent to url from client => endpoint and endpoint => client", async () => {
        let endpointBody = "I'm an endpoint";
        endpoint = await endpointServer(serverPort, endpointBody);
        let response = await axiosInstance.get(relayURI + "/some/other/path/with/a?search=query");
        expect(request.method).toBe("GET");
        expect(request.url).toBe("/some/other/path/with/a?search=query");
        expect(response.data).toBe("I'm an endpoint");
    });
    test("listener is transparent to headers from client => endpoint and endpoint => client", async () => {
        let endpointBody = "I'm an endpoint";
        endpoint = await endpointServer(serverPort, endpointBody);
        let response = await axiosInstance.get(relayURI, { headers: { "random": "header" } });
        expect(request.method).toBe("GET");
        expect(request.url).toBe("/");
        expect(request.headers.random).toBe("header");
        expect(response.headers["content-type"]).toBe("application/json");
        expect(response.headers["endpoint"]).toBe("this is an endpoint header");
        expect(response.data).toBe("I'm an endpoint");
    });
    test("listener does not leak servicebus tokens", async () => {
        let endpointBody = "I'm an endpoint";
        endpoint = await endpointServer(serverPort, endpointBody);
        let response = await axiosInstance.get(relayURI);
        expect(request.method).toBe("GET");
        expect(request.url).toBe("/");
        expect(Object.keys(request.headers).join("")).toMatch(new RegExp("accept", "i"));
        expect(Object.keys(request.headers).join("")).not.toMatch(new RegExp("servicebus", "i"));
        expect(response.data).toBe("I'm an endpoint");
    });
    test("listener is transparent to http POST data from client => endpoint and endpoint => client", async () => {
        let endpointBody = { "I'm an endpoint": "but completely different", "array": Array.from({ length: 2 ** 20 }, () => 0) };
        endpoint = await endpointServer(serverPort, JSON.stringify(endpointBody));
        const requestBody = { "payload": "some stuff", "array": Array.from({ length: 2 ** 20 }, () => 0) };
        let response = await axiosInstance.post(relayURI, requestBody);
        expect(request.method).toBe("POST");
        expect(request.url).toBe("/");
        expect(request.data).toBe(JSON.stringify(requestBody));
        expect(response.data).toEqual(endpointBody);
    });
});
function endpointServerHttps(port, endpointRes) {
    let server = https.createServer(certs, async (_req, _res) => {
        request = _req;
        _req.setEncoding("utf8");
        request.data = "";
        await new Promise((res) => _req.on("data", (data) => request.data += data).on("close", () => res(true)));
        _res.setHeader("content-type", "application/json");
        _res.write(endpointRes);
        _res.end();
    });
    return new Promise((resolve, reject) => {
        server.on("listening", () => resolve(server));
        server.on("error", (e) => { console.log(e); reject(e); });
        server.listen(port);
    });
}
describe("listener with https endpoint", async () => {
    let relay;
    let server = "tessiverse-test.servicebus.windows.net";
    let path = "test-relay";
    let endpoint;
    let serverURI = new URL("https://localhost");
    let relayURI = "https://" + server + "/" + path;
    let serverPort = 3000;
    serverURI.port = `${serverPort}`;
    beforeAll(async () => {
        relay = await createListener(server, path, serverURI.toString());
    });
    afterAll(async () => {
        relay.close(() => { });
    });
    afterEach(() => {
        endpoint.close();
    });
    test("listener is transparent to https GET from client => endpoint and endpoint => client", async () => {
        let endpointBody = "I'm an endpoint";
        endpoint = await endpointServerHttps(serverPort, endpointBody);
        let response = await axiosInstance.get(relayURI);
        expect(request.method).toBe("GET");
        expect(request.url).toBe("/");
        expect(response.data).toBe("I'm an endpoint");
    });
    test("listener is transparent to https POST from client => endpoint and endpoint => client", async () => {
        let endpointBody = { "I'm an endpoint": "but completely different", "array": Array.from({ length: 2 ** 20 }, () => 0) };
        endpoint = await endpointServerHttps(serverPort, JSON.stringify(endpointBody));
        const requestBody = { "payload": "some stuff", "array": Array.from({ length: 2 ** 20 }, () => 0) };
        let response = await axiosInstance.post(relayURI, requestBody);
        expect(request.method).toBe("POST");
        expect(request.url).toBe("/");
        expect(request.data).toBe(JSON.stringify(requestBody));
        expect(response.data).toEqual(endpointBody);
    });
});
//# sourceMappingURL=listener.test.js.map