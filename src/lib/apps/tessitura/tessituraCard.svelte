<script lang="ts">
	import type { Serializable } from '$lib/apps';
    import { Badge } from '$lib/components/ui/badge'
    import * as ERRORS from '$lib/errors'
	import type { TessituraAppLoad } from './tessitura';
    let { data } : { data: Promise<TessituraAppLoad> } = $props()
</script>

{#await data}
    <Badge class="mw-min ml-auto animate-pulse">Loading...</Badge>
{:then tessi}
    <Badge class="mw-min ml-auto bg-green-600">Connected</Badge>
    <p>API server: {tessi.tessiApiUrl}</p>
    <p>Username: {tessi.userid}</p>
    <p>Group: {tessi.group}</p>
{:catch error}
{#if error.id == ERRORS.USER_NOT_FOUND.id}
    <Badge class="mw-min ml-auto bg-destructive">User not found</Badge>
{:else}
    <Badge class="mw-min ml-auto bg-destructive">Error</Badge>
{/if}
{/await}