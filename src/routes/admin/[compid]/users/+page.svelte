<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import { page } from '$app/state';

	const { data }: PageProps = $props();

	const compid = page.params.compid!;
</script>

<BackButton to={resolve('/admin/[compid]', { compid })} />
<div class="container mx-auto p-4">
	<h1 class="mt-2 mb-6 text-center text-3xl font-bold">User Predictions</h1>

	{#if data.users.length > 0}
		<ul class="space-y-4">
			{#each data.users as user (user.userId)}
				<li class="rounded-lg bg-gray-100 px-4 py-2 shadow-sm">
					<p class="text-lg font-semibold">{user.userName}</p>
					<p class="text-sm text-gray-500">User ID: {user.userId}</p>
					<a
						class="font-medium hover:underline"
						href={resolve('/admin/[compid]/users/[userid]', {
							compid,
							userid: user.userId.toString()
						})}>View Predictions</a
					>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-center text-gray-600">No have made predictions for this competition.</p>
	{/if}
</div>
