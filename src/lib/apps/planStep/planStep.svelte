<script lang="ts">
    import * as Dialog from '$lib/components/ui/dialog';
    import * as Form from '$lib/components/ui/form';
    import * as Select from '$lib/components/ui/select';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import type { PlanStepAppLoad } from './planStep';
	import { planStepSchema } from './planStep.schema';
    import SuperDebug, { superForm, type SuperForm, type Infer } from 'sveltekit-superforms';
    import { zodClient } from 'sveltekit-superforms/adapters';
    import PlanStepReadme from './planStep.md'
	import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '$lib/components/ui/accordion';
	import { LoaderCircle } from 'lucide-svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
    let { data, open = $bindable(true) }: { data: PlanStepAppLoad, open?: boolean} = $props()
    
    console.log(data)
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

    const { form: formData, message, submitting, enhance } = form

    let selectedStepType = $state({value: 0})
    var stepTypes =  fetch("/tq/steptypes/summaries")
            .then((res) => res.json())
            .then((json: {id: number, description: string}[]) => json.map((s) => {return {value: s.id, label: s.description}}))
            .then((s) => s.sort((a,b) => a.label>b.label ? 1 : -1))

    stepTypes.then((s) => selectedStepType = s.filter((e) => e.value == data.stepType)[0])

</script>

<Dialog.Root bind:open={open} closeOnEscape={false} closeOnOutsideClick={false}>
    <Dialog.Content class="md:w-2/3 max-w-full max-h-svh">
        <ScrollArea class="max-h-[calc(100svh-3rem)]">
            <Dialog.Header class="flex w-full prose max-w-full prose-default mb-4">
            <Accordion><AccordionItem value="planstepreadme">
                    <AccordionTrigger class="text-xl decoration-primary mr-4">
                        <span class="rainbow">Email to plan step</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <PlanStepReadme/>
                    </AccordionContent>
                </AccordionItem></Accordion>
        </Dialog.Header>

    <form method="POST" use:enhance action="?/planStep" class="grid grid-cols-2 gap-4">
        <Form.Field {form} name="stepType">
            <Form.Control let:attrs>
                <Form.Label class="block">Step Type</Form.Label>
                <Select.Root {...attrs} selected={selectedStepType}
                    onSelectedChange={(v: {value: number} | undefined) => { $formData.stepType = v ? v.value : 0}}
                    >
                {#await stepTypes}
                    <Select.Trigger>
                        <Select.Value placeholder="Loading step types..." />
                    </Select.Trigger>
                {:then stepTypes}
                    <Select.Trigger>
                        <Select.Value placeholder="Choose a step type" />
                    </Select.Trigger>  
                    <Select.Content>
                    {#each stepTypes as stepType}
                        <Select.Item value={stepType.value} label={stepType.label}></Select.Item>
                    {/each}
                    </Select.Content>
                {/await}
                    <Select.Input {...attrs} bind:value={$formData.stepType} />
                </Select.Root>
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="closeStep">
            <Form.Control let:attrs>
                <Form.Label class="block">Close Step </Form.Label>
                <Switch
                includeInput
                    {...attrs}
                    bind:checked={$formData.closeStep}
                />
                <div class="text-sm text-muted-foreground">Close step immediately upon creation</div>
                </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        <Form.Button class="col-start-2 justify-self-end px-10 relative">
            Save
            {#if $submitting}            
            <LoaderCircle class="animate-spin absolute right-2 h-4"/>
            {/if}
        </Form.Button>
        </form>
    </ScrollArea>
    </Dialog.Content>
</Dialog.Root> 