<script lang="ts">
	import { page } from '$app/state';
	import CubeIcon from '$lib/components/CubeIcon.svelte';
	import { eventNames } from '$lib/types';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const compId = page.params.compid;
</script>

<svelte:head>
	<title>Pickems Dashboard for {data.competitionName}</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br">
	<div class="mx-auto max-w-4xl px-4 py-12">
		<!-- Header Section -->
		<div class="mb-10 text-center">
			<h1 class="mb-3 text-4xl font-bold text-slate-800">
				{data.competitionName?.competitionName || 'Competition Events'}
			</h1>
			<p class="text-lg text-slate-600">Select an event to make your predictions</p>
		</div>

		<!-- Events List -->
		{#if data.competitionEvents && data.competitionEvents.length > 0}
			<div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
				{#each data.competitionEvents as event, index (index)}
					<a
						href="{compId}/{event.event}"
						class="group flex items-center justify-between border-b border-slate-100 px-5 py-4 transition-colors duration-200 last:border-b-0 hover:bg-slate-50"
					>
						<div class="flex items-center space-x-4">
							<!-- Event Icon -->
							<CubeIcon event={event.event} class="scale-150" />

							<!-- Event Details -->
							<div>
								<h3
									class="text-lg font-medium text-slate-900 transition-colors duration-200 group-hover:text-indigo-600"
								>
									{eventNames[event.event] || event.event}
								</h3>
							</div>
						</div>

						<!-- Arrow -->
						<svg
							class="h-5 w-5 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-indigo-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
							></path>
						</svg>
					</a>
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
							d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						></path>
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-medium text-slate-700">No Events Available</h3>
				<p class="text-slate-500">There are currently no events available for this competition.</p>
			</div>
		{/if}
	</div>
</div>
