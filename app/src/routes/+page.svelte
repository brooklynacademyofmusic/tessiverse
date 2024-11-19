<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    import { Card } from "$lib/components/ui/card";
    import AppCard from "$lib/components/appCard.svelte";
	import type { PageData } from "./$types";
    import Readme from "./readme.md"
    import { Ellipsis } from "lucide-svelte"
    import { fade } from "svelte/transition"
    let { data }: {data: PageData} = $props()
    
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
<article class="grid md:grid-cols-2 grid-cols-1 gap-8 min-h-[10rem]">
    <AppCard title = "Tessitura integration">
        {#await data.name}
        <Badge class="w-min ml-auto animate-pulse">Loading...</Badge>
        <Ellipsis class="inline-block w-12 h-12 text-secondary animate-pulse"/>
        {:then name }
        <Badge class="w-min ml-auto bg-green-600">Connected</Badge>
        <p>Username: Username</p>
        <p>Group: Group</p>
        <p>API server: https://tessitura.api</p>
        {:catch name }
        <Badge class="w-min ml-auto bg-destructive">Error</Badge>
        <p>Username: Username</p>
        <p>Group: Group</p>
        <p>API server: https://tessitura.api</p>
        {/await}
    </AppCard>
    <AppCard title = "Plan Steps by Email" disabled={true}>
        Test another thing
    </AppCard>
</article>
