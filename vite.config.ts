import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['**/*.{test,spec}.{js,ts}'],
		env: loadEnv('', process.cwd(), ''),
		testTimeout: 15000
	}
});
