<script lang="ts">
    import { Card, CardTitle, CardHeader, CardContent, CardDescription, CardFooter } from "./ui/card"
    import { Button } from "./ui/button"
    import { Settings } from "lucide-svelte"
    import { cn } from "../utils"
    let { title, children, disabled = false, class: className = undefined } = $props()
    
    if (disabled) {
        var blur = "blur-sm opacity-50"
    }
</script>

<Card class={cn("flex flex-col border-primary",blur,className)}>
    <div class="w-full rounded-t bg-secondary p-3 font-extralight tracking-tight">{title}</div>
    <CardContent class="grow flex flex-col">{@render children()}</CardContent>
    <div class="text-right">
        {#if !disabled}
        <Button size="icon" variant="ghost" class="text-secondary-foreground border-primary border-r-0 border-b-0">
            <Settings class="w-5 h-5"/>
        </Button>
        {/if}
    </div>
</Card>