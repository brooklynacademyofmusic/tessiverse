<script lang="ts">
    import Tessitura from "$lib/apps/tessitura/tessitura.svelte";
	import type { PageData } from "./$types";
    let { data }: { data: PageData } = $props()
</script>
<Tessitura { data }/>