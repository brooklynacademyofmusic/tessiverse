<script lang="ts">
    import * as Dialog from '$lib/components/ui/dialog';
    import * as Form from '$lib/components/ui/form';
    import * as Select from '$lib/components/ui/select';
	import { onMount } from 'svelte';
	import type { PlanStepAppLoad } from './planStep';
	import { planStepSchema } from './planStep.schema';
    import { superForm, type SuperForm, type Infer } from 'sveltekit-superforms';
    import { zodClient } from 'sveltekit-superforms/adapters';
	import { a } from 'vitest/dist/chunks/suite.B2jumIFP.js';
	import { json } from '@sveltejs/kit';
    let { data, open = $bindable(true) }: { data: PlanStepAppLoad, open?: boolean} = $props()
    
    let form: SuperForm<Infer<typeof planStepSchema>> = 
        superForm(data.form,
            {
                validators: zodClient(planStepSchema),
                delayMs: 3000,
                onResult: async ( {result} ) => {
                    if (result.type === "success") {
                        $message = ""
                        open = false
                    }
                }
            })

    var stepTypes =  fetch("/tq/steptypes/summaries")
            .then((res) => res.json())
            .then((json: {id: number, description: string}[]) => json.map((s) => {return {value: s.id, label: s.description}}))
            .then((s) => s.sort((a,b) => a.label>b.label ? 1 : -1))

    const { form: formData, message, submitting, delayed, enhance } = form
</script>

<Dialog.Root bind:open={open} closeOnEscape={false} closeOnOutsideClick={false}>
    <Dialog.Content>
        <Dialog.Header class="flex w-full items-center bg-secondary justify-center">
            Email to Plan Steps
        </Dialog.Header>

    <form method="POST" use:enhance action="?/planStep">
        <Form.Field {form} name="stepType">
            <Form.Control let:attrs>
                <Form.Label>Step Type</Form.Label>
                <Select.Root {...attrs} selected={{value: data.stepType}}
                    onSelectedChange={(v: {value: number} | undefined) => { $formData.stepType = v ? v.value : -1}}>
                <Select.Trigger>
                    <Select.Value placeholder="Choose a step type" />
                </Select.Trigger>
                <Select.Content>
                {#await stepTypes then stepTypes}
                {#each stepTypes as stepType}
                  <Select.Item value={stepType.value} label={stepType.label}></Select.Item>
                {/each}
                {/await}
                </Select.Content>
                <Select.Input {...attrs} bind:value={$formData.stepType} />
              </Select.Root>
                </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        </form>
    </Dialog.Content>
    </Dialog.Root> 