<script lang="ts">
    import { Badge } from '$lib/components/ui/badge'
    import * as ERRORS from '$lib/errors'
    let data = $props()
</script>

{#await data.config}
    <Badge class="w-min ml-auto animate-pulse">Loading...</Badge>
{:then name }
    <Badge class="w-min ml-auto bg-green-600">Connected</Badge>
<p>Username: Username</p>
<p>Group: Group</p>
<p>API server: https://tessitura.api</p>
{:catch error }
    <Badge class="w-min ml-auto bg-destructive">Error</Badge>
{#if error.id == ERRORS.USER_NOT_FOUND.id}
    New user!
{:else}
    Ooops!
{/if}
{/await}