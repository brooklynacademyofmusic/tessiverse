import { TessituraAppServer } from "$lib/apps/tessitura/tessitura.server"
import { Azure, UserLoaded } from "$lib/azure"
import { User } from "$lib/user"
import type { Actions } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import type { TessituraAppSave } from "$lib/apps/tessitura/tessitura"

export const load: PageServerLoad = async ({locals}) => {
    let backend = new Azure()
    let user = await backend.load({identity: locals.user.userDetails}).catch(() => new User(locals.user.userDetails) as UserLoaded)
    let tessi = new TessituraAppServer()
    return await tessi.load(user)
}

export const actions: Actions = {
    tessitura: async ({locals, request}) => {
        let formData = await request.formData()
        let backend = new Azure()
        let user = await backend.load({identity: locals.user.userDetails}).catch(() => new User(locals.user.userDetails) as UserLoaded)
        let tessi = new TessituraAppServer()
        return await tessi.save(formData as any, user)    
    } 
}