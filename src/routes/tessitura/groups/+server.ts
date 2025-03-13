import { TessituraAppServer } from "$lib/apps/tessitura/tessitura.server";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({setHeaders}) => {
    setHeaders({"cache-control": "max-age=3600, public"})
    return TessituraAppServer.tessiGroups()
        .then((groups) => json(groups))
}