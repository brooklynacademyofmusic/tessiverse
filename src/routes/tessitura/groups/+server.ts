import { TessituraAppServer } from "$lib/apps/tessitura/tessitura.server";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
    return TessituraAppServer.tessiGroups()
    .then((groups) => json(groups))
}