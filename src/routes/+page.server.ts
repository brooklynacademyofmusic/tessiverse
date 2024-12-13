import type { PageServerLoad, Action, Actions } from './$types';
import { User, UserLoaded } from '$lib/user';
import * as config from '$lib/config'
import { Azure } from '$lib/azure';


//Typescript magic!
function hasProperty<O extends object>(o: O, k: PropertyKey): k is keyof O {
    return k in o
}

type AppPromise = { [K in keyof config.Apps]: Promise<config.Apps[K]> }
const apps = new config.Apps()

export const load: PageServerLoad = async ( { locals }) => {
    let backend = new Azure()
    let user = new User("ssyzygy").load()
    let appData: any = {} 
    for(let key in apps) {
        appData[key] = user.then((u) => u.load({identity: u.identity, app: key})).catch(()=>{})
    }
    // const appData = objectMap(new config.Apps(),(app) => (app.load(user)))
    return {userData: JSON.parse(JSON.stringify(user)), appData: appData as AppPromise}
}

export const actions: Actions = {}
for(let key in apps) {
    if (hasProperty(apps,key))
        actions[key] = async ({request, locals}) => {
            Promise.all([request.formData(), new User(locals.user.userDetails).load()])
            .then(([data,user]) => apps[key].save(user, data))
            .then((failure) => failure)
        } 
    }


