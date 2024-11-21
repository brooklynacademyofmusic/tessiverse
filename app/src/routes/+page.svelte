<script lang="ts">

    import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "$lib/components/ui/accordion";
    import { Badge } from "$lib/components/ui/badge";
    import { Card } from "$lib/components/ui/card";
    import { AlertDialog, AlertDialogCancel, AlertDialogContent } from "$lib/components/ui/alert-dialog";
    import AppCard from "$lib/components/appCard.svelte";
	import type { PageData } from "./$types";
    import Readme from "./readme.md"
    import { Ellipsis } from "lucide-svelte"
    import { fade } from "svelte/transition"
    import * as errors from "$lib/errors"
    
    let { data }: {data: PageData} = $props()
    let error = $state()
</script>

<article class="prose max-w-none font-extralight">
    <h1 class="text-foreground font-extralight text-6xl">Hi, 
        {#await data.config}
            <Ellipsis class="animate-pulse inline-block w-12 h-12 text-secondary"/>
        {:then config }
            <span transition:fade>{ config }!</span>
        {:catch e }
            {#if e.id == errors.USER_NOT_FOUND.id+1}
                <AlertDialog open={true}>
                    <AlertDialogContent class="md:w-max max-w-none">
                        <div class="text-4xl mx-auto">✨🪐✨ Welcome to the <span class="rainbow">tessiverse</span> ✨🪐✨</div>
                        Error! {e.message}
                    </AlertDialogContent>
                </AlertDialog>
            {:else}
            <AlertDialog open={true}>
                <AlertDialogContent class="border-destructive focus:ring-0 ring-0">
                    Error! {e.message}
                </AlertDialogContent>
            </AlertDialog>
            {/if}
        {/await} 
    </h1>
    <Card class="min-h-16 p-4 shadow-3xl shadow-primary dark:prose-headings:text-white">
        <Accordion class="w-full"><AccordionItem value="readme" class="border-0">
            <AccordionTrigger class="text-4xl flex hover:no-underline">
                <div class="mx-auto">✨🪐✨ Welcome to the <span class="rainbow">tessiverse</span> ✨🪐✨</div></AccordionTrigger>
            <AccordionContent><Readme/></AccordionContent>
        </AccordionItem></Accordion>
    </Card>
</article>
<article class="grid md:grid-cols-2 grid-cols-1 gap-8 min-h-[10rem]">
    <AppCard title = "Tessitura integration">
        {#await data.config}
        <Badge class="w-min ml-auto animate-pulse">Loading...</Badge>
        {:then name }
        <Badge class="w-min ml-auto bg-green-600">Connected</Badge>
        <p>Username: Username</p>
        <p>Group: Group</p>
        <p>API server: https://tessitura.api</p>
        {:catch error }
        <Badge class="w-min ml-auto bg-destructive">Error</Badge>
        {#if error.id == errors.USER_NOT_FOUND.id}
            New user!
        {:else}
            Ooops!
        {/if}
        {/await}
    </AppCard>
    <AppCard title = "Plan Steps by Email" disabled={true}>
        Test another thing
    </AppCard>
</article>
