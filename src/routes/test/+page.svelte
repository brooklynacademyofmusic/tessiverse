<script lang="ts">
    import Tessitura from '$lib/components/tessitura.svelte'
    import { superForm, type SuperForm, type Infer } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { formSchema } from "$lib/components/tessitura.schema"

    let {servers = [{value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
                    {value: "https://tessi-test-b", label: "TESSI-TEST-B/Impresario"}],
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