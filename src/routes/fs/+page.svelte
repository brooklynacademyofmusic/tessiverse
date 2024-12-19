<script lang="ts">
	import type { PageData } from "./$types";

    let { data } : {data: PageData } = $props()

</script>

<h1>data.dir</h1>
{#await data.dir then dir}
    {#each dir as d}
        <br/>{d}
    {/each}
{:catch}
    Error with data.dir
{/await}

<h1>data.ls</h1>
{#await data.tq then ls}
    {JSON.stringify(ls)}
{/await}