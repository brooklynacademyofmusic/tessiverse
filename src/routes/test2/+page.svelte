<script lang="ts">
    import type { PageData } from './$types'
    let { data }: {data: PageData} = $props()
</script>

<h1 class="text-foreground font-extralight text-6xl">
        {data.userData}
        {#await data.userData}
            waiting...
        {:then user}
            success: {JSON.stringify(user)}
        {:catch e }
            failure: {JSON.stringify(e)}
        
        {/await} 
</h1>