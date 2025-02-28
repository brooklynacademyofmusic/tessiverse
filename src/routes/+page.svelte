<script lang="ts">
    import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "$lib/components/ui/accordion";
    import { Card } from "$lib/components/ui/card";
    import AppCard from "$lib/components/appCard.svelte";
	import type { PageData } from "./$types";
    import Readme from "./readme.md"
    import Ellipsis from "lucide-svelte/icons/ellipsis"
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
            <span transition:fade>{ user.apps.tessitura.firstname }</span>
        {/await} 
    </h1>
    <Card class="min-h-16 text-lg text-center p-8 shadow-3xl shadow-primary dark:prose-headings:text-white">
        <span class="rainbow hover:underline font-bold">the tessiverse</span> is a collection of apps for importing, exporting and otherwise interacting with Tessitura data.            
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
