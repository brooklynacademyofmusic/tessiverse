<script lang="ts">
    import * as Card from "./ui/card"
    import { Button } from "./ui/button"
    import { Settings } from "lucide-svelte"
    import { cn } from "../utils"
	import { Dialog } from "./ui/dialog";
    let { title, children, config, data, class: className = undefined } = $props()
    let open = $state(false)
</script>

<Card.Root class={cn("flex flex-col border-primary shadow-3xl shadow-primary",className)}>
    <div class="w-full rounded-t bg-secondary p-3 font-extralight tracking-tight">{title}</div>
    <Card.CardContent class="grow flex flex-col">{@render children()}</Card.CardContent>
    <div class="text-right">
        <Button size="icon" variant="ghost" class="text-secondary-foreground border-primary border-r-0 border-b-0">
            <Settings class="w-5 h-5" onclick = {() => {open = true}}/>
        </Button>
    </div>
</Card.Root>
{#await data then data}
{#if typeof config.form === "function"}
<config.form {data} bind:open = {open}/>
{/if}
{/await}