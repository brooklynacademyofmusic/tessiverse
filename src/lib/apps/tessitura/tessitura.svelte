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
	import type { TessituraAppLoad } from './tessitura';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import { tick } from 'svelte';
	
    let servers = config.servers
    let select
    
    let groups = fetch("/tessitura/groups").then((res) => res.json())
    let selectedGroup = $state({value: "", label: ""})
    groups.then((g: {value: string, label:string}[]) => selectedGroup = g.filter((v) => v.value === $formData.group)[0])

    let { data, open = $bindable(true) }: { data: TessituraAppLoad, open?: boolean} = $props()
    
    let form: SuperForm<Infer<typeof tessituraSchema>> = 
        superForm(data.form,
            {
                validators: zodClient(tessituraSchema),
                delayMs: 3000,
                onResult: async ( {result} ) => {
                    if (result.type === "success") {
                        $message = ""
                        open = false
                    }
                }
            })

    const { form: formData, message, submitting, delayed, enhance } = form
    let buttonText = $derived($delayed ? "Saving..." : $submitting ? "Validating..." : "Log In")

    const scroll = function() {

    }

</script>
<Dialog.Root bind:open={open} closeOnEscape={false} closeOnOutsideClick={false}>
    <Dialog.Content>
        <Dialog.Header class="flex w-full h-48 items-center justify-center">
            {#if $mode === "light"}<img src={logoLight} class="w-1/2" alt="Tessitura Logo"/>
            {:else if $mode === "dark"}<img src={logoDark} class="w-1/2" alt="Tessitura Logo"/>
            {/if}
        </Dialog.Header>

    <form method="POST" use:enhance action="?/tessitura">
        <Form.Field {form} name="tessiApiUrl">
            <Form.Control let:attrs>
                <Form.Label>Server</Form.Label>
                    <Select.Root {...attrs} selected={servers.filter((e: any) => e.value === $formData.tessiApiUrl)[0]}
                            onSelectedChange={(v: {value: string} | undefined) => { $formData.tessiApiUrl = v ? v.value : ""}}>
                        <Select.Trigger>
                            <Select.Value placeholder="Choose a server" />
                        </Select.Trigger>
                        <Select.Content>
                        {#each servers as server}
                          <Select.Item value={server.value} label={server.label}></Select.Item>
                        {/each}
                        </Select.Content>
                        <Select.Input {...attrs} bind:value={$formData.tessiApiUrl} />
                      </Select.Root>
                </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="userid">
            <Form.Control let:attrs >
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
                    <div {...attrs}>
                    <Select.Root {...attrs} 
                        onOpenChange={() => {
                            tick().then(() => {
                                let el = document.querySelector(`div[id="${attrs.id}"] *[data-selected]`)
                                if(el)
                                    el.scrollIntoView({block: "center"})
                            })
                        }}

                        selected = {selectedGroup}
                        onSelectedChange={(v: {value: string} | undefined) => { $formData.group = v ? v.value : ""}}>
                        {#await groups}
                        <Select.Trigger>
                            <Select.Value placeholder="Loading groups..." />
                        </Select.Trigger>
                        {:then groups}
                        <Select.Trigger>
                            <Select.Value placeholder="Choose a group" />
                        </Select.Trigger>
                        <Select.Content>
                            <ScrollArea class="h-64">
                        {#each groups as group}
                          <Select.Item value={group.value} label={group.label}></Select.Item>
                        {/each}
                            </ScrollArea>   
                        </Select.Content>
                        {:catch}
                        <Select.Trigger>
                            <Select.Value placeholder="Error loading groups!" />
                        </Select.Trigger>
                        {/await}
                        <Select.Input bind:value={$formData.group}/>
                    </Select.Root>
                    </div>
                </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
            <div class="text-foreground">{$message}</div>
        <Form.Button class="mt-5 w-full relative">
            {buttonText}
            {#if $submitting}            
                <LoaderCircle class="animate-spin absolute right-4 h-4"/>
            {/if}
            </Form.Button>
    </form>
</Dialog.Content>
</Dialog.Root>