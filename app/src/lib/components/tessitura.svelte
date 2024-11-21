<script lang="ts">
    import { Dialog } from '$lib/components/ui/dialog'
    import * as Form from '$lib/components/ui/form'
    import { Input } from '$lib/components/ui/input'
    import { Select } from '$lib/components/ui/select'
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { formSchema } from "./tessitura.schema"

    let data = $props()
    const form = superForm(data, {
		validators: zodClient(formSchema),
	});
    const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
    <Form.Field {form} name="username">
        <Form.Control let:attrs>
            <Form.Label>Username</Form.Label>
            <Input {...attrs} bind:value={$formData.username} />
        </Form.Control>
        <Form.Description />
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="password">
        <Form.Control let:attrs>
            <Form.Label>Password</Form.Label>
            <Input {...attrs} bind:value={$formData.password} />
        </Form.Control>
        <Form.Description />
        <Form.FieldErrors />
      </Form.Field>
</form>