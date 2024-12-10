<script lang="ts">
    import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "$lib/components/ui/accordion";
    import { Card } from "$lib/components/ui/card";
    import Signup from "$lib/components/signup.svelte";
    import AppCard from "$lib/components/appCard.svelte";
	import type { PageData } from "./$types";
    import Readme from "./readme.md"
    import { Ellipsis } from "lucide-svelte"
    import { fade } from "svelte/transition"
    let { data }: { data: PageData} = $props()
</script>

<article class="prose max-w-none font-extralight">
    <h1 class="text-foreground font-extralight text-6xl">Hi, 
        {#await data.userData}
            <Ellipsis class="animate-pulse inline-block w-12 h-12 text-secondary"/>
        {:then user}
            <span transition:fade>{ JSON.stringify(user) }</span>
        {:catch e }
            <Signup /> 
        {/await} 
    </h1>
    <Card class="min-h-16 p-4 shadow-3xl shadow-primary dark:prose-headings:text-white">
        <Accordion class="w-full"><AccordionItem value="readme" class="border-0">
            <AccordionTrigger class="text-lg hover:no-underline align-text-bottom">
                <span class="rainbow">the tessiverse</span> is a collection of apps for importing, exporting and otherwise interacting with Tessitura data.            
            </AccordionTrigger>
            <AccordionContent><Readme/></AccordionContent>
        </AccordionItem></Accordion>
    </Card>
</article>
<article class="grid md:grid-cols-2 grid-cols-1 gap-8 min-h-[10rem]">
    <!-- {#each Object.entries(appData) as [_, app]}
        {#await app}
            <Ellipsis class="animate-pulse inline-block w-12 h-12 text-secondary"/>
        {:then app} 
            <AppCard title = {app.title}>
                <app.card {...app} />
            </AppCard>            
        {/await}
    {/each} -->
</article>
