<script lang="ts">
    import type { PlanStepAppLoad } from '$lib/apps/planStep/planStep'
    let { data }: { data: Promise<PlanStepAppLoad> } = $props()
</script>

{#await data then data}
    <span class="text-secondary-foreground">Number of plan steps you've created by email:</span>
    <div class="text-9xl text-primary justify-center text-center">{data.history.length}</div> 
{/await}