import { HttpResponseInit } from "@azure/functions";
import axios from 'axios';
import * as path from 'path';

const tq_api_url = process.env.TQ_API_URL;

export async function httpError(message: string): Promise<HttpResponseInit> {
    return {
        status: 400,
        jsonBody: {
            message: message
        }
    }
}

export async function tq_get(paths: string[], params: object, auth: string): Promise<any> {
    axios.get(path.join.apply(null,[tq_api_url].concat(paths)), {
        params: params,
        headers: {TQ_LOGIN: auth}}).then(
            (resp) => {
                return resp.data
            })
}

export async function tq_post(paths: string[], params: object, auth: string): Promise<any> {
    axios.post(path.join.apply(null,[tq_api_url].concat(paths)), {
        data: params,
        headers: {TQ_LOGIN: auth}}).then(
            (resp) => {
                return resp.data
            })
}

export async function tq_put(paths: string[], params: object, auth: string): Promise<any> {
    axios.put(path.join.apply(null,[tq_api_url].concat(paths)), {
        data: params,
        headers: {TQ_LOGIN: auth}}).then(
            (resp) => {
                return resp.data
            })
}