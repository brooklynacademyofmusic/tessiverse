<script lang="ts">
    import type { PageData } from "./$types"
    import Tessitura from '$lib/apps/tessitura/tessitura.svelte'
    import { superForm, type SuperForm, type Infer } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { tessituraSchema } from "$lib/apps/tessitura/tessitura.schema"
	import { TessituraApp } from "$lib/apps/tessitura/tessitura";

    let { data }: { data: PageData } = $props()

</script>
{#await data.appData.tessitura then tessitura}
<Tessitura form={superForm({userid: tessitura.userid || "", group: tessitura.group || "", tessiApiUrl: tessitura.tessiApiUrl, password: ""}, {
		validators: zodClient(tessituraSchema),
	})} action={"?/"+tessitura.key} servers={tessitura.servers} groups={tessitura.groups}/>
{/await}