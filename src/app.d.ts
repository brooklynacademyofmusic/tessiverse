// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
            message: string;
			id?: number;
		}
		interface Locals {
			user: clientPrincipal
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};