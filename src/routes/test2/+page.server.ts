import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
    return {userData: "test", appData: {}}
}