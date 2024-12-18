<script lang="ts">
    import type { PageData } from "./$types"
    import Tessitura from '$lib/apps/tessitura/tessitura.svelte'
    
    let { data }: { data: PageData } = $props()

</script>
{#await data.appData.tessitura then tessitura}
<Tessitura data={{userid: tessitura.userid, group: tessitura.group, tessiApiUrl: tessitura.tessiApiUrl, valid: true, key: "tessitura"}} />
{/await}