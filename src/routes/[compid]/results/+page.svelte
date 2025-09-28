<script lang="ts">
	import { eventNames } from '$lib/types';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const totalScore = $derived(
		data.predictions?.reduce(
			(total, event) =>
				total +
				event.predictions.reduce((eventTotal, prediction) => eventTotal + prediction.score, 0),
			0
		) || 0
	);
</script>

<svelte:head>
	<title>My Results - WCA Pickems</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br">
	<div class="mx-auto max-w-5xl px-4 py-12">
		<!-- Header Section -->
		<div class="mb-8">
			<h1 class="mb-2 text-center text-3xl font-bold text-gray-900">
				My Results for {data.compName}
			</h1>
			<div class="text-center text-lg">
				My Score: {totalScore}
				{totalScore === 1 ? 'point' : 'points'}
			</div>
		</div>

		<!-- Events List -->
		{#if data.predictions && data.predictions.length > 0}
			<div class="space-y-6">
				{#each data.predictions as event (event)}
					{@const eventScore = event.predictions.reduce(
						(total, prediction) => total + prediction.score,
						0
					)}
					<div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
						<div class="border-b border-slate-200 bg-slate-50 px-4 py-4">
							<div class="flex items-center justify-between">
								<h2 class="text-xl font-semibold text-slate-900">
									{eventNames[event.event]}
								</h2>
								<div class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
									{eventScore}
									{eventScore === 1 ? 'point' : 'points'}
								</div>
							</div>
						</div>

						<div>
							{#each event.predictions as prediction, idx (idx)}
								<div
									class="flex items-center justify-between px-4 py-2 transition-colors hover:bg-slate-50"
								>
									<div>
										<p class="font-medium text-slate-900">{prediction.name}</p>
										<div class="flex">
											<p class="me-4 text-sm text-slate-500">Predicted #{prediction.placement}</p>
											<p class="text-sm text-slate-500">
												{prediction.actual > 0
													? `Finished #${prediction.actual}`
													: 'Did not place top 8'}
											</p>
										</div>
									</div>

									<div class="flex items-center">
										{#if prediction.score > 0}
											<span
												class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
											>
												+{prediction.score.toFixed(2)}
												{prediction.score === 1 ? 'point' : 'points'}
											</span>
										{:else}
											<span
												class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
											>
												0 points
											</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Empty state -->
			<div
				class="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white py-16"
			>
				<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
					<svg class="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						></path>
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-medium text-slate-700">No Results Available</h3>
				<p class="text-slate-500">Your prediction results will appear here once available.</p>
			</div>
		{/if}
	</div>
</div>
