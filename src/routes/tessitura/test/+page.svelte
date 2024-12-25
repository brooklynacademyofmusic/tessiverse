<script lang="ts">
    import type { PageData, PageServerData } from "./$types"

    let { data } : {data: PageServerData} = $props()
    
</script>
<style>
    :global(main) {
        gap: 1em !important
    }
</style>

{#snippet error(e: any)}
    <span class="text-red-500">error</span>
    <br/><code>{JSON.stringify(e)}</code>
{/snippet}

{#each Object.entries(data) as [key,value]}
    <p><b>{key}</b>: 
        {#await value then value}
            {#if value === true}
                <span class="text-green-500">success!</span>
            {:else}
                {@render error(value)}
            {/if}
        {:catch e }
            {@render error(value)}
        {/await}
    </p>
{/each}
