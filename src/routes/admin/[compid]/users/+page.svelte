<script lang="ts">
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-3xl font-bold">User Predictions</h1>

	{#if data.users.length > 0}
		<ul class="space-y-4">
			{#each data.users as user (user.userId)}
				<li class="rounded-lg bg-gray-100 p-4 shadow-sm">
					<p class="text-lg font-semibold">{user.userName}</p>
					<p class="text-sm text-gray-500">User ID: {user.userId}</p>
					<a href="users/{user.userId}">View Predictions</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-center text-gray-600">No have made predictions for this competition.</p>
	{/if}
</div>
