
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
    
    return {
        name: new Promise((resolve) => {setTimeout(() => resolve("Sky"), 2000)})
    }
}