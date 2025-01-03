<script lang="ts">
    import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "$lib/components/ui/accordion";
    import { Card } from "$lib/components/ui/card";
    import AppCard from "$lib/components/appCard.svelte";
	import type { PageData } from "./$types";
    import Readme from "./readme.md"
    import { Ellipsis } from "lucide-svelte"
    import { fade } from "svelte/transition"
    let { data }: { data: PageData} = $props()
    let { userData, appData } = $derived(data)
    import * as config from '$lib/config'
    let apps = new config.Apps()
    function hasProperty<O extends object>(o: O, k: PropertyKey): k is keyof O {
        return k in o
    }
</script>

<article class="prose max-w-none font-extralight">
    <h1 class="text-foreground font-extralight text-6xl">Hi, 
        {#await userData}
            <Ellipsis class="animate-pulse inline-block w-12 h-12 text-secondary"/>
        {:then user}
            <span transition:fade>{ user.firstname }</span>
        {/await} 
    </h1>
    <Card class="min-h-16 p-4 shadow-3xl shadow-primary dark:prose-headings:text-white">
        <Accordion class="w-full"><AccordionItem value="readme" class="border-0">
            <AccordionTrigger class="text-lg decoration-primary align-text-bottom">
                <span class="rainbow hover:underline">the tessiverse</span> is a collection of apps for importing, exporting and otherwise interacting with Tessitura data.            
            </AccordionTrigger>
            <AccordionContent class="prose-default prose"><Readme/></AccordionContent>
        </AccordionItem></Accordion>
    </Card>
</article>
<article class="grid md:grid-cols-2 grid-cols-1 gap-8 min-h-[10rem]">
    {#each Object.entries(apps) as [key, app]}
    <AppCard title = {app.title} config = {app} data = {appData[key]}>
        {#if typeof app.card === "function" && hasProperty(appData,key)}
            <app.card data = {appData[key]}/>
        {:else}
            {app.title} does not have a card!
            {#await appData[key] catch e}
            <div class="text-destructive">{e.message}</div>
            {/await}
        {/if}
    </AppCard>            

    {/each}
</article>
