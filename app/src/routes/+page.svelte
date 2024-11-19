<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import Card from "$lib/components/ui/card/card.svelte";
	import type { PageData } from "./$types";
    import Readme from "./readme.md"
    import { Ellipsis } from "lucide-svelte"
    import { fade } from "svelte/transition"
    let { data }: {data: PageData} = $props()
	import { invalidateAll } from "$app/navigation";
    
</script>

<article class="prose max-w-none font-extralight">
    <h1 class="text-foreground font-extralight text-6xl">Hi, 
        {#await data.name}
            <Ellipsis class="animate-pulse inline-block w-12 h-12 text-secondary"/>
        {:then name }
            <span transition:fade>{ name }</span>
        {/await} 
    !</h1>
    <Card class="min-h-16 p-4 bg-primary shadow-3xl shadow-primary text-center">
        <Readme/>
    </Card>
</article>
<article class="grid grid-cols-2 gap-8 min-h-[10rem]">
    <Card class="p-4 border-primary">
        Test a thing
    </Card>
    <Card class="p-4 border-primary">
        Test another thing
    </Card>
</article>
