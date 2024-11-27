<script lang="ts">
    import Tessitura from '$lib/apps/tessitura/tessitura.svelte'
    import { superForm, type SuperForm, type Infer } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { formSchema } from "$lib/apps/tessitura/tessitura.schema"
    import * as config from "$lib/config"

    let {servers = config.servers,
        groups = [{value: "PlanMem", label: "Membership (full-time)"}],
        user = {
            userid: "ssyzygy",
            tessiApiUrl: "https://tessi-db-prd1",
            group: "PlanMem",
            password: ""
        }} = $props();

    const form: SuperForm<Infer<typeof formSchema>> = superForm(user, {
		validators: zodClient(formSchema),
	});
    const {form: formData} = form
    $effect(() => {
        groups.push({value: $formData.userid, label: $formData.userid})
    })
</script>

<Tessitura form={form} action="/user?/login" servers={servers} groups={groups}/>