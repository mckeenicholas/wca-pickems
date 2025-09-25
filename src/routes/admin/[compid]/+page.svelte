<script lang="ts">
	import { page } from '$app/state';
	import BackButton from '$lib/components/BackButton.svelte';
	import CubeIcon from '$lib/components/CubeIcon.svelte';
	import { eventNames } from '$lib/types';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const compid = page.params.compid!;

	let loadingStates = $state<Record<string, boolean>>({});
	let allowEdits = $state(data.competition?.allowEdits ?? false);
	let toggleLoading = $state(false);

	async function calculateScores(event: string) {
		// Set loading state for this specific event
		loadingStates[event] = true;

		try {
			const response = await fetch(
				resolve('/admin/[compid]/[eventid]/calculate', { compid, eventid: event }),
				{
					method: 'POST'
				}
			);

			if (!response.ok) {
				const error = await response.json();
				console.error('Error calculating scores:', error);
			}
		} catch (error) {
			console.error('Network error:', error);
		} finally {
			loadingStates[event] = false;
		}
	}

	async function toggleAllowEdits() {
		toggleLoading = true;

		try {
			const response = await fetch(`/admin/${compid}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ allowEdits: !allowEdits })
			});

			if (response.ok) {
				allowEdits = !allowEdits;
			}
		} catch (error) {
			console.error('Network error:', error);
		} finally {
			toggleLoading = false;
		}
	}
</script>

<BackButton to={resolve('/admin')} />

<div class="absolute top-4 right-1">
	<a href={resolve('/admin/[compid]/users', { compid })}>
		<div
			class="flex items-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-lg font-medium text-white shadow"
		>
			View Users
		</div>
	</a>
</div>

<div class="min-h-screen bg-gradient-to-br">
	<div class="mx-auto max-w-4xl px-4 py-12">
		<!-- Header Section -->
		<div class="mb-10 text-center">
			<h1 class="mb-3 text-4xl font-bold text-slate-800">
				Admin: {compid}
			</h1>
		</div>

		<!-- Competition Settings -->
		<div class="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
			<div class="border-b border-slate-200 bg-slate-50 px-6 py-4">
				<h2 class="text-lg font-medium text-slate-900">Competition Settings</h2>
			</div>
			<div class="px-6 py-4">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-base font-medium text-slate-900">Allow Edits</h3>
						<p class="text-sm text-slate-600">
							{allowEdits
								? 'Participants can currently edit their registrations'
								: 'Registration editing is currently disabled'}
						</p>
					</div>
					<button
						onclick={toggleAllowEdits}
						disabled={toggleLoading}
						class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 {allowEdits
							? 'bg-indigo-600'
							: 'bg-slate-200'}"
					>
						<span class="sr-only">Toggle allow edits</span>
						<span
							class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {allowEdits
								? 'translate-x-5'
								: 'translate-x-0'}"
						>
							{#if toggleLoading}
								<!-- Loading spinner -->
								<span class="absolute inset-0 flex h-full w-full items-center justify-center">
									<svg class="h-3 w-3 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
									</svg>
								</span>
							{:else}
								<!-- Status indicators -->
								<span
									class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity {allowEdits
										? 'opacity-0'
										: 'opacity-100'}"
								>
									<svg class="h-3 w-3 text-slate-400" fill="currentColor" viewBox="0 0 12 12">
										<path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"></path>
									</svg>
								</span>
								<span
									class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity {allowEdits
										? 'opacity-100'
										: 'opacity-0'}"
								>
									<svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
										<path
											d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
										></path>
									</svg>
								</span>
							{/if}
						</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Events List -->
		{#if data.competitionEvents && data.competitionEvents.length > 0}
			<div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
				<div class="border-b border-slate-200 bg-slate-50 px-6 py-4">
					<h2 class="text-lg font-medium text-slate-900">Competition Events</h2>
				</div>
				{#each data.competitionEvents as event, index (index)}
					<div>
						<a
							href={resolve('/[compid]/[eventid]', { compid, eventid: event.event })}
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
			</div>
		{/if}
	</div>
</div>
