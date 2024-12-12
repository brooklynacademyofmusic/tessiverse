<script lang="ts">
    import { Badge } from '$lib/components/ui/badge'
    import * as ERRORS from '$lib/errors'
	import type { TessituraApp } from './tessitura';
    let { data } : { data: Partial<TessituraApp> } = $props()
</script>

{#await data}
    <Badge class="w-min ml-auto animate-pulse">Loading...</Badge>
{:then tessi }
    <Badge class="w-min ml-auto bg-green-600">Connected</Badge>
    <p>Username: {tessi.userid}</p>
    <p>Group: {tessi.group}</p>
    <p>API server: {tessi.tessiApiUrl}</p>
{:catch error }
{#if error.id == ERRORS.USER_NOT_FOUND.id}
    <Badge class="w-min ml-auto bg-destructive">User not found</Badge>
{:else}
    <Badge class="w-min ml-auto bg-destructive">Error</Badge>
{/if}
{/await}