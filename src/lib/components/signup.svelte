<script lang="ts">
    import * as Alert from '$lib/components/ui/alert-dialog'
    import * as Dialog from '$lib/components/ui/dialog'
    import Tessitura from "$lib/apps/tessitura/tessitura.svelte"
	import { ChevronRight } from 'lucide-svelte';
    let ok = $state(false);
    let data = $props();
</script>

<!-- signup flow, rendered if no user exists 
- welcome dialog
- blank tessitura form
-->

<Alert.AlertDialog open={!ok} closeOnEscape={false}>
    <Alert.AlertDialogContent class="flex flex-col">
            <div class="text-xl text-center">✨🪐✨ Welcome to <span class="rainbow">the tessiverse</span> ✨🪐✨</div>
            <p><span class="rainbow">the tessiverse</span> is a collection of apps for importing, exporting and otherwise interacting with Tessitura data.
            <p>To get started you'll need to login with Tessitura.
            <p class="text-right"><Alert.AlertDialogAction onclick={() => ok = true}>Next<ChevronRight/></Alert.AlertDialogAction>
    </Alert.AlertDialogContent>
</Alert.AlertDialog>
<Dialog.Root open={ok} closeOnEscape={false}>
    <Dialog.Content>
          <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
          <Dialog.Description>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </Dialog.Description>
          <!-- <Tessitura /> -->
      </Dialog.Content>
</Dialog.Root>