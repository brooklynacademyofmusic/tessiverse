<script lang="ts">
    import * as Card from "./ui/card"
    import { Button } from "./ui/button"
    import { Settings } from "lucide-svelte"
    import { Switch } from "./ui/switch"
    import { cn } from "../utils"
    let { title, children, disabled = false, class: className = undefined } = $props()
    var blur = $derived(
        disabled ? "blur-sm opacity-50" : ""
    )
</script>

<Card.Root class={cn("flex flex-col border-primary shadow-3xl shadow-primary",blur,className)}>
    <div class="w-full rounded-t bg-secondary p-3 font-extralight tracking-tight">{title}</div>
    <Card.CardContent class="grow flex flex-col">{@render children()}</Card.CardContent>
    <div class="text-right">
        <Switch bind:checked={disabled} />
        <Button size="icon" variant="ghost" class="text-secondary-foreground border-primary border-r-0 border-b-0">
            <Settings class="w-5 h-5"/>
        </Button>
    </div>
</Card.Root>