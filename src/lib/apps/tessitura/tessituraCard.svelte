<script lang="ts">
	import Signup from '$lib/components/signup.svelte';
    import { Badge } from '$lib/components/ui/badge'
    import * as ERRORS from '$lib/errors'
	import type { TessituraAppLoad } from './tessitura';
    let { data } : { data: Promise<TessituraAppLoad> } = $props()
    import { servers } from '$lib/const';
	import { onMount } from 'svelte';
    let groups: Promise<{value: string, label: string}[]> = $state(new Promise(() => {}))
    onMount(() => 
        groups = fetch("/tessitura/groups")
                .then((res) => res.json())
    )
</script>

{#await data}
    <Badge class="mw-min ml-auto animate-pulse">Loading...</Badge>
{:then tessi}
    {#if tessi.tessiApiUrl}
        {#if tessi.valid}<Badge class="mw-min ml-auto bg-green-600">Connected</Badge>
        {:else}<Badge class="mw-min ml-auto bg-destructive">Invalid login</Badge>
        {/if}
        <p><span>API server:</span> <span class="text-primary">{servers.filter((v) => v.value === tessi.tessiApiUrl)[0].label}</span></p>
        <p><span>Username:</span> <span class="text-primary">{tessi.userid}</span></p>
        <p><span>Tessi #:</span> <span class="text-primary">{tessi.constituentid}</span></p>
        <p><span>Group:</span> <span class="text-primary">
            {#await groups then groups} 
                {groups.filter((g) => g.value === tessi.group)[0].label}
            {:catch e}
                {tessi.group}
            {/await}
        </span></p>
    {:else}
        <Signup data={tessi}/>
    {/if}
{:catch error}
{#if error.id == ERRORS.USER_NOT_FOUND.id}
    <Badge class="mw-min ml-auto bg-destructive">User not found</Badge>
{:else}
    <Badge class="mw-min ml-auto bg-destructive">Error</Badge>
{/if}
{/await}