import { env } from '$env/dynamic/private';
import axios from 'axios';
import * as path from 'path';

const tq_api_url = env.TQ_API_URL || "";

export async function tqGet(paths: string[], params: object, auth: string): Promise<any> {
    axios.get(path.join.apply(null,[tq_api_url].concat(paths)), {
        params: params,
        headers: {TQ_LOGIN: auth}}).then(
            (resp) => {
                return resp.data
            })
}

export async function tqPost(paths: string[], params: object, auth: string): Promise<any> {
    axios.post(path.join.apply(null,[tq_api_url].concat(paths)), {
        data: params,
        headers: {TQ_LOGIN: auth}}).then(
            (resp) => {
                return resp.data
            })
}

export async function tqPut(paths: string[], params: object, auth: string): Promise<any> {
    axios.put(path.join.apply(null,[tq_api_url].concat(paths)), {
        data: params,
        headers: {TQ_LOGIN: auth}}).then(
            (resp) => {
                return resp.data
            })
}