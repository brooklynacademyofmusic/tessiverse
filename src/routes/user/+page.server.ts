import type { PageServerLoad, Actions } from './$types';

export const actions = {
    groups: async({ request }) => {
        return "here"
    },
	login: async ({ cookies, request }) => {
        // TODO login
    },
	register: async (event) => {
		// TODO register
	}
} satisfies Actions;