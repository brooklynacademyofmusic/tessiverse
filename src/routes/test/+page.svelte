<script lang="ts">
    import Tessitura from '$lib/apps/tessitura/tessitura.svelte'
    import { superForm, type SuperForm, type Infer } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { tessituraSchema } from "$lib/apps/tessitura/tessitura.schema"

    let {servers = [],
        groups = [{value: "PlanMem", label: "Membership (full-time)"}],
        user = {
            userid: "ssyzygy",
            tessiApiUrl: "https://tessi-db-prd1",
            group: "PlanMem",
            password: ""
        }} = $props();

    const form: SuperForm<Infer<typeof tessituraSchema>> = superForm(user, {
		validators: zodClient(tessituraSchema),
	});
    const {form: formData} = form
    $effect(() => {
        groups.push({value: $formData.userid, label: $formData.userid})
    })
</script>

<Tessitura form={form} action="/user?/login" servers={servers} groups={groups}/>