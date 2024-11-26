<script lang="ts">

    import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "$lib/components/ui/accordion";
    import TessituraCard from "$lib/components/tessituraCard.svelte";
    import { Card } from "$lib/components/ui/card";
    import Signup from "$lib/components/signup.svelte";
    import AppCard from "$lib/components/appCard.svelte";
	import type { PageData } from "./$types";
    import Readme from "./readme.md"
    import { Ellipsis } from "lucide-svelte"
    import { fade } from "svelte/transition"
    
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
    <AppCard title = "Tessitura integration">
        <TessituraCard />
    </AppCard>
    <AppCard title = "Plan Steps by Email" disabled={true}>
        Test another thing
    </AppCard>
</article>
