<script lang="ts">
	import { eventNames, type WCAEvent } from '$lib/types';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<main class="container mx-auto p-4">
	{#if data.userName.length > 0}
		<h1 class="mb-6 text-3xl font-bold">Predictions for {data.userName[0].name}</h1>
	{:else}
		<h1 class="mb-6 text-3xl font-bold">User Not Found</h1>
	{/if}

	{#if Object.keys(data.predictions).length > 0}
		{#each Object.entries(data.predictions) as [event, predictionsForEvent] (event)}
			<section class="mb-8 rounded-lg bg-gray-100 p-4 shadow-sm">
				<h2 class="mb-4 text-2xl font-semibold capitalize">{eventNames[event as WCAEvent]}</h2>
				<ul class="space-y-2">
					{#each predictionsForEvent as prediction (prediction.competitorName)}
						<li class="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
							<span class="font-medium">{prediction.competitorName}</span>
							<span class="text-lg font-bold text-blue-600">
								Place: {prediction.place} - Score {prediction.score}
							</span>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{:else}
		<p class="text-center text-gray-600">No predictions found for this user.</p>
	{/if}
</main>
