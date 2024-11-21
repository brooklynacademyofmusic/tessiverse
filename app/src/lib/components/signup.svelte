<script lang="ts">
    import { AlertDialog, AlertDialogContent, AlertDialogAction } from '$lib/components/ui/alert-dialog'
	import { ChevronRight } from 'lucide-svelte';
    let ok = false    
</script>

<!-- signup flow, rendered if no user exists 
- welcome dialog
- blank tessitura form
-->

<AlertDialog open={!ok} closeOnEscape={false}>
    <AlertDialogContent class="flex flex-col">
            <div class="text-xl text-center">✨🪐✨ Welcome to <span class="rainbow">the tessiverse</span> ✨🪐✨</div>
            <p><span class="rainbow">the tessiverse</span> is a collection of apps for importing, exporting and otherwise interacting with Tessitura data.
            <p>To get started you'll need to login with Tessitura.
            <p class="text-right"><AlertDialogAction>Next<ChevronRight/></AlertDialogAction>
    </AlertDialogContent>
</AlertDialog>
