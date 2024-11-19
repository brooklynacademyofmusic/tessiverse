<script lang="ts">
	import "../app.css"
	let { children } = $props();
	import { Button } from "$lib/components/ui/button";
	import DarkLight from "$lib/components/darklight.svelte";
	import Github from "$lib/components/github.svelte";
	import { ModeWatcher } from "mode-watcher";
	let repo = "skysyzygy/tessiverse"
</script>

<ModeWatcher />
<div class="dark:bg-black bg-white flex min-h-screen w-full flex-col">
	<nav class="hidden md:flex gap-2 p-1 bg-secondary w-full justify-end">
	  <Button size="sm" class="bg-secondary border-secondary-foreground" variant="outline">Logout</Button>
	  <DarkLight />
	  <Github repo={repo} />
	</nav>
	<main class="flex flex-col p-6 gap-8 max-w-screen-lg mx-auto w-full">
			{@render children()}
	</main>

</div>
