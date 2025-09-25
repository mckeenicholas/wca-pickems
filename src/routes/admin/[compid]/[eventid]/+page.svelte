<script lang="ts">
	import { page } from '$app/state';
	import DragReorder from '$lib/components/DragReorder.svelte';
	import { eventNames, type WCAEvent } from '$lib/types';
	import { MAX_PICKS } from '$lib/util';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	let competitors = $state(data.competitors ?? []);
	let results = $state(data.results ?? []);
	let saveStatus = $state<'idle' | 'saving' | 'success' | 'error'>('idle');
	let errorMessage = $state<string>('');

	const saveResults = async () => {
		try {
			saveStatus = 'saving';
			errorMessage = '';

			// Limit to max allowed picks
			const limitedResults = results.slice(0, MAX_PICKS);
			const indexedResults = limitedResults.map((p, i) => ({ ...p, placement: i + 1 }));

			const response = await fetch('', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					results: indexedResults
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to save results');
			}

			saveStatus = 'success';

			// Reset to idle after 2 seconds
			setTimeout(() => {
				saveStatus = 'idle';
			}, 2000);
		} catch (error) {
			console.error('Error saving results:', error);
			saveStatus = 'error';
			errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

			// Reset to idle after 5 seconds
			setTimeout(() => {
				saveStatus = 'idle';
				errorMessage = '';
			}, 5000);
		}
	};
</script>

<div class="min-h-screen bg-gradient-to-br pt-4">
	<div class="mx-auto max-w-6xl">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold text-slate-800">
				Admin: Enter Results for {page.params.compid} Event: {eventNames[
					page.params.eventid as WCAEvent
				]}
			</h1>
		</div>

		<div class="flex justify-center">
			<button
				class="group relative overflow-hidden rounded-lg px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 ease-out
						{saveStatus === 'saving'
					? 'cursor-not-allowed bg-blue-400'
					: saveStatus === 'success'
						? 'bg-green-500 hover:bg-green-600'
						: saveStatus === 'error'
							? 'bg-red-500 hover:bg-red-600'
							: 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'}"
				onclick={saveResults}
			>
				<!-- Button content -->
				<div class="relative flex items-center">
					{#if saveStatus === 'saving'}
						<div
							class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
						Saving...
					{:else if saveStatus === 'success'}
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
						Saved!
					{:else if saveStatus === 'error'}
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							></path>
						</svg>
						Retry
					{:else}
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
							></path>
						</svg>
						Save Results
					{/if}
				</div>
			</button>
		</div>

		<!-- Main Content Card -->
		<div class="mt-2">
			<!-- Drag Reorder Component -->
			<DragReorder top8List={results} bankList={competitors} results />

			<!-- Status Messages -->
			{#if saveStatus !== 'idle'}
				<div class="fixed bottom-4 left-1/2 z-50 w-auto -translate-x-1/2 transform">
					{#if saveStatus === 'saving'}
						<div class="flex items-center justify-center rounded-lg bg-blue-50 p-4 shadow-lg">
							<div
								class="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
							></div>
							<span class="font-medium text-blue-700">Saving results...</span>
						</div>
					{:else if saveStatus === 'success'}
						<div class="flex items-center justify-center rounded-lg bg-green-50 p-4 shadow-lg">
							<svg
								class="mr-3 h-5 w-5 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
							<span class="font-medium text-green-700">Results saved successfully!</span>
						</div>
					{:else if saveStatus === 'error'}
						<div class="rounded-lg bg-red-50 p-4 shadow-lg">
							<div class="flex items-center">
								<svg
									class="mr-3 h-5 w-5 text-red-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<div>
									<div class="font-medium text-red-700">Failed to save results</div>
									{#if errorMessage}
										<div class="text-sm text-red-600">{errorMessage}</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
