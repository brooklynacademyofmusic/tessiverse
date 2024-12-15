<script lang="ts">
    import * as Dialog from '$lib/components/ui/dialog'
    import * as Form from '$lib/components/ui/form'
    import { Input } from '$lib/components/ui/input'
    import * as Select from '$lib/components/ui/select'
    import { mode } from 'mode-watcher';
    import { type SuperForm, type Infer, superForm } from "sveltekit-superforms";
    import { tessituraSchema } from "./tessitura.schema"
    import logoLight from "$lib/assets/tessitura_logo_light.svg"
    import logoDark from "$lib/assets/tessitura_logo_dark.svg"
    import { zodClient } from "sveltekit-superforms/adapters";
    import * as config from "$lib/const"
	import type { TessituraApp } from './tessitura';
	import type { Serializable } from '$lib/apps';
	
    let servers = config.servers
    let groups = config.servers
    let { data }: { data: Serializable<TessituraApp> & {valid: boolean, groups: string[]} } = $props()
    
    
    let form: SuperForm<Infer<typeof tessituraSchema>> = 
        superForm({tessiApiUrl: data.tessiApiUrl, userid: data.userid, group: data.group, password: ""}, 
            {validators: zodClient(tessituraSchema)})

    const { form: formData, enhance } = form

</script>
<Dialog.Root open={true}>
    <Dialog.Content>
        <Dialog.Header class="flex w-full h-48 items-center justify-center">
            {#if $mode === "light" }<img src={logoLight} class="w-1/2" alt="Tessitura Logo"/>
            {:else if $mode === "dark" }<img src={logoDark} class="w-1/2" alt="Tessitura Logo"/>
            {/if}
        </Dialog.Header>

    <form method="POST" use:enhance action="?/tessitura">
        <Form.Field {form} name="tessiApiUrl">
            <Form.Control let:attrs>
                <Form.Label>Server</Form.Label>
                <Select.Root {...attrs} selected={servers.filter((e: any) => e.value === $formData.tessiApiUrl)[0]} items={servers}>
                    <Select.Trigger>
                        <Select.Value placeholder="Choose a server" />
                    </Select.Trigger>
                    <Select.Content>
                    {#each servers as server}
                      <Select.Item value={server.value} label={server.label}></Select.Item>
                    {/each}
                    </Select.Content>
                    <Select.Input bind:value={$formData.tessiApiUrl} />
                  </Select.Root>
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="userid">
            <Form.Control let:attrs>
                <Form.Label>User ID</Form.Label>
                <Input {...attrs} bind:value={$formData.userid}/>
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="password" >
            <Form.Control let:attrs>
                <Form.Label>Password</Form.Label>
                <Input {...attrs} type="password" bind:value={$formData.password} />
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="group">
            <Form.Control let:attrs>
                <Form.Label>User Group</Form.Label>
                <Select.Root {...attrs} selected={groups.filter((e) => e.value === $formData.group)[0]} items={groups}>
                    <Select.Trigger>
                        <Select.Value placeholder="Choose a group" />
                    </Select.Trigger>
                    <Select.Content>
                    {#each groups as group}
                      <Select.Item value={group.value} label={group.label}></Select.Item>
                    {/each}
                    </Select.Content>
                    <Select.Input bind:value={$formData.group} />
                  </Select.Root>
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        <Form.Button class="mt-5 w-full">Log In</Form.Button>
    </form>
</Dialog.Content>
</Dialog.Root>