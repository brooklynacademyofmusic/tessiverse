<script lang="ts">
    import type { PageData } from "./$types"

    let { data } : {data: PageData} = $props()
    
</script>

{#each Object.entries(data) as [key,value]}
    <p><b>{key}</b>: 
        {#if value}
            <span class="text-green-500">success!</span>
        {:else}
            <span class="text-red-500">error</span>
        {/if}
        </p>
{/each}
