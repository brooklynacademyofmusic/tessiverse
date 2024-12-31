<script lang="ts">
    import * as Alert from '$lib/components/ui/alert-dialog'
    import Tessitura from "$lib/apps/tessitura/tessitura.svelte"
	import { ChevronRight } from 'lucide-svelte';
	import type { TessituraAppLoad } from '$lib/apps/tessitura/tessitura';
    let { data }: { data: TessituraAppLoad } = $props()
    let ok = $state(true);
</script>

<!-- signup flow, rendered if no user exists 
- welcome dialog
- blank tessitura form
-->

<Alert.AlertDialog closeOnEscape={false} open={!ok}>
    <Alert.AlertDialogContent class="flex flex-col">
            <div class="text-xl text-center">✨🪐✨ Welcome to <span class="rainbow">the tessiverse</span> ✨🪐✨</div>
            <p><span class="rainbow">the tessiverse</span> is a collection of apps for importing, exporting and otherwise interacting with Tessitura data.
            <p>To get started you'll need to login with Tessitura.
            <p class="text-right"><Alert.AlertDialogAction onclick={() => ok = true}>Next<ChevronRight/></Alert.AlertDialogAction>
    </Alert.AlertDialogContent>
</Alert.AlertDialog>
{#if ok}
<Tessitura {data} />
{/if}