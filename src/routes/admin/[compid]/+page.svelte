<script lang="ts">
	import { page } from '$app/state';
	import CubeIcon from '$lib/components/CubeIcon.svelte';
	import { eventNames } from '$lib/types';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const compId = page.params.compid;

	let loadingStates = $state<Record<string, boolean>>({});

	async function calculateScores(event: string) {
		// Set loading state for this specific event
		loadingStates[event] = true;

		try {
			const response = await fetch(`/admin/${compId}/${event}/calculate`, {
				method: 'POST'
			});

			if (response.ok) {
				// Success feedback - you could add a toast notification here
				console.log(`Scores calculated successfully for ${event}`);
				// Optional: Show success message or refresh data
			} else {
				const error = await response.json();
				console.error('Error calculating scores:', error);
				// Optional: Show error message
			}
		} catch (error) {
			console.error('Network error:', error);
			// Optional: Show error message
		} finally {
			// Clear loading state
			loadingStates[event] = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br">
	<div class="mx-auto max-w-4xl px-4 py-12">
		<!-- Header Section -->
		<div class="mb-10 text-center">
			<h1 class="mb-3 text-4xl font-bold text-slate-800">
				Admin: {compId}
			</h1>
		</div>

		<!-- Events List -->
		{#if data.competitionEvents && data.competitionEvents.length > 0}
			<div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
				{#each data.competitionEvents as event, index (index)}
					<div>
						<a
							href="{compId}/{event.event}"
							class="group flex items-center justify-between border-b border-slate-100 pe-4 transition-colors duration-200 last:border-b-0 hover:bg-slate-50"
						>
							<!-- Left side - Event link -->
							<div class="flex flex-1 items-center space-x-4 px-5 py-4">
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

							<!-- Right side - Calculate button and arrow -->
							<div class="flex items-center space-x-3">
								<!-- Calculate Scores Button -->
								<button
									onclick={(e) => {
										e.preventDefault();
										calculateScores(event.event);
									}}
									disabled={loadingStates[event.event]}
									class="flex items-center space-x-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-indigo-400"
								>
									{#if loadingStates[event.event]}
										<!-- Loading spinner -->
										<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"
											></path>
										</svg>
										<span>Calculating...</span>
									{:else}
										<!-- Calculator icon -->
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
											></path>
										</svg>
										<span>Calculate</span>
									{/if}
								</button>

								<!-- Arrow -->
								<svg
									class="h-5 w-5 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-indigo-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									></path>
								</svg>
							</div>
						</a>
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
