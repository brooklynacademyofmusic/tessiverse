import { z } from "zod";
import { type AppConfig } from '$lib/config'
import Tessitura from '$lib/apps/tessitura/tessitura.svelte' 
import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte' 
import { tq } from '$lib/tq'
import { error } from '@sveltejs/kit'
import * as ERRORS from '$lib/errors'
import { admin_auth } from '$lib/config'

export const formSchema = z.object({
  tessiApiUrl: z.string().min(4).max(64),
  userid: z.string().min(4).max(64),
  password: z.string().min(4).max(64),
  group: z.string().min(4).max(64)
});

export class TessituraConfig implements AppConfig {
  title = "Tessitura Integration"
  card = TessituraCard
  config = Tessitura
  action =  () => {}
  firstname: string = ""
  lastname: string = ""
  userid: string = ""
  inactive: boolean = false
  locked: boolean = false
  constituentid: number = -1
  group: string = ""
  tessiApiUrl: string = ""
  location: string = ""

    get auth() {
      return this.tessiApiUrl+"|"+this.userid+"|"+this.group+"|"+this.location
  }


  async loadFromTessi() {
    return tq("get","users",admin_auth,{"username":this.userid}).
        then((tessi) => {
            Object.assign(this, tessi)
            return this
        }).catch(() => 
            error(500, ERRORS.TQ)
        )
}
}  