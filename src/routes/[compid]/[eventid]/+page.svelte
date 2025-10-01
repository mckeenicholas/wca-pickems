<script lang="ts">
	import { page } from '$app/state';
	import DragReorder from '$lib/components/DragReorder.svelte';
	import type { PageProps } from './$types';
	import { eventNames, type WCAEvent } from '$lib/types';
	import { MAX_PICKS } from '$lib/util';
	import BackButton from '$lib/components/BackButton.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	const LOCAL_STORAGE_KEY = 'wca-pickems.hasSeenDirections';

	const { data }: PageProps = $props();

	const eventid = page.params.eventid!;
	const compid = page.params.compid!;

	let competitors = $state(data.competitors ?? []);
	let predictions = $state(data.predictions ?? []);
	let saveStatus = $state<'idle' | 'saving' | 'success' | 'error'>('idle');
	let hiddenStatus = $state(false);
	let errorMessage = $state<string>('');

	let isInfoModalOpen = $state(false);

	const savePredictions = async () => {
		try {
			saveStatus = 'saving';
			errorMessage = '';

			// Limit to max predictions
			const limitedPredictions = predictions.slice(0, MAX_PICKS);
			const indexedPredictions = limitedPredictions.map((p, i) => ({ ...p, placement: i + 1 }));

			const response = await fetch('', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					predictions: indexedPredictions
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to save predictions');
			}

			saveStatus = 'success';

			// Reset to idle after 2 seconds
			setTimeout(() => {
				saveStatus = 'idle';
			}, 2000);
		} catch (error) {
			console.error('Error saving predictions:', error);
			saveStatus = 'error';
			errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

			// Reset to idle after 5 seconds
			setTimeout(() => {
				saveStatus = 'idle';
				errorMessage = '';
			}, 5000);
		}
	};

	onMount(() => {
		const hasSeen = localStorage.getItem(LOCAL_STORAGE_KEY) == 'true';
		hiddenStatus = hasSeen;

		if (!hasSeen) {
			isInfoModalOpen = true;
		}
	});

	const closeModal = () => {
		isInfoModalOpen = false;

		console.log(hiddenStatus);

		localStorage.setItem(LOCAL_STORAGE_KEY, hiddenStatus.toString());
	};
</script>

<svelte:head>
	<title>Enter Predictions for {eventNames[eventid as WCAEvent]}</title>
</svelte:head>

<BackButton to={resolve('/[compid]', { compid })} />
<div class="min-h-screen bg-gradient-to-br pt-4">
	<div class="mx-auto max-w-6xl">
		<div class="mb-8 flex items-center justify-center">
			<h1 class="text-3xl font-bold text-slate-800">
				Predictions for {data.comp.name} - {eventNames[eventid as WCAEvent]}
			</h1>

			<div>
				<button
					class="ml-3 rounded-md bg-slate-300 p-1 text-slate-600 shadow-md transition-colors hover:bg-slate-300"
					onclick={() => (isInfoModalOpen = true)}
					aria-label="View directions"
				>
					<svg
						class="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
				</button>
			</div>
		</div>

		{#if !data.comp.allowEdits}
			<div class="mt-4 text-center">
				<p class="text-sm text-slate-500">Editing is currently disabled for this competition</p>
			</div>
		{:else}
			<div class="flex justify-center">
				<button
					class="group relative overflow-hidden rounded-lg px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 ease-out
                        {saveStatus === 'saving'
						? 'cursor-not-allowed bg-blue-400'
						: saveStatus === 'success'
							? 'bg-green-500 hover:bg-green-600'
							: saveStatus === 'error'
								? 'bg-red-500 hover:bg-red-600'
								: 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'}
                        {!data.comp.allowEdits ? 'cursor-not-allowed opacity-50' : ''}"
					onclick={savePredictions}
					disabled={saveStatus === 'saving' || !data.comp.allowEdits}
				>
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
							Save Predictions
						{/if}
					</div>
				</button>
			</div>
		{/if}

		<div class="mt-2">
			<DragReorder
				top8List={predictions}
				bankList={competitors}
				freeze={!data.comp.allowEdits}
				multi={page.params.eventid == '333mbf'}
			/>

			{#if saveStatus !== 'idle'}
				<div class="fixed bottom-4 left-1/2 z-50 w-auto -translate-x-1/2 transform">
					{#if saveStatus === 'saving'}
						<div class="flex items-center justify-center rounded-lg bg-blue-50 p-4 shadow-lg">
							<div
								class="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
							></div>
							<span class="font-medium text-blue-700">Saving predictions...</span>
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
							<span class="font-medium text-green-700">Predictions saved successfully!</span>
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
									<div class="font-medium text-red-700">Failed to save predictions</div>
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

{#if isInfoModalOpen}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
		onclick={() => (isInfoModalOpen = false)}
		onkeydown={(e) => {
			if (e.key === 'Escape') isInfoModalOpen = false;
		}}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
			role="document"
			onclick={(e) => e.stopPropagation()}
		>
			<h2 id="modal-title" class="mb-4 text-2xl font-bold text-slate-800">Directions</h2>
			<div class="space-y-4 text-slate-700">
				<ol class="list-inside list-decimal space-y-2 pl-4">
					<li>
						Drag a competitor from the left-hand list (all competitors) into the right-hand
						(predictions) list.
					</li>
					<li>
						Reorder the competitors in the prediction list by dragging them to their desired rank.
					</li>
					<li>You may predict up to {MAX_PICKS} competitors for each event.</li>
					<li>Click the "Save Predictions" button to submit your final ranking.</li>
				</ol>
				<p class="text-sm text-slate-500">
					On mobile devices, long-press on a competitor to drag them.
				</p>
				<p class="text-sm text-slate-500">
					Your predictions will be scored based on how accurately your predictions match the top {MAX_PICKS}
					placements.
				</p>
			</div>
			<div class="text-slate-80 mt-4">
				<input id="modal-dont-show-again" type="checkbox" bind:checked={hiddenStatus} />
				<label for="modal-dont-show-again" class="select-none">Don't show this message again.</label
				>
			</div>

			<div class="mt-4 flex justify-end">
				<button
					class="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
					onclick={() => closeModal()}
				>
					Got It!
				</button>
			</div>
		</div>
	</div>
{/if}
