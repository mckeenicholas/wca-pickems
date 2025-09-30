<script lang="ts">
	import { page } from '$app/state';
	import BackButton from '$lib/components/BackButton.svelte';
	import CubeIcon from '$lib/components/CubeIcon.svelte';
	import { eventNames } from '$lib/types';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import Toggle from '$lib/components/Toggle.svelte';

	const { data }: PageProps = $props();

	const compid = page.params.compid!;

	let loadingStates = $state<Record<string, boolean>>({});
	let allowEdits = $state(data.competition?.allowEdits ?? false);
	let visible = $state(data.competition?.isVisible ?? false);
	let toggleLoading = $state(false);
	let visibilityToggleLoading = $state(false);
	let syncLoading = $state(false);

	async function calculateScores(event: string) {
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
			const response = await fetch(resolve('/admin/[compid]', { compid }), {
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

	async function toggleVisibility() {
		visibilityToggleLoading = true;

		try {
			const response = await fetch(resolve('/admin/[compid]', { compid }), {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ visible: !visible })
			});

			if (response.ok) {
				visible = !visible;
			}
		} catch (error) {
			console.error('Network error:', error);
		} finally {
			visibilityToggleLoading = false;
		}
	}

	async function syncCompetition() {
		syncLoading = true;

		try {
			const response = await fetch(resolve('/admin/[compid]/sync', { compid }), {
				method: 'POST'
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('Error syncing competition:', error);
			}
		} catch (error) {
			console.error('Network error:', error);
		} finally {
			syncLoading = false;
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
			<div class="divide-y divide-slate-200">
				<!-- Allow Edits Toggle -->
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
						<Toggle
							disabled={toggleLoading}
							onclick={toggleAllowEdits}
							value={allowEdits}
							id="edit-toggle"
						/>
					</div>
				</div>

				<!-- Visibility Toggle -->
				<div class="px-6 py-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-base font-medium text-slate-900">Competition Visibility</h3>
							<p class="text-sm text-slate-600">
								{visible
									? 'Competition is visible to participants'
									: 'Competition is hidden from participants'}
							</p>
						</div>
						<Toggle
							disabled={visibilityToggleLoading}
							onclick={toggleVisibility}
							value={visible}
							id="visibility-toggle"
						/>
					</div>
				</div>

				<!-- Sync Button -->
				<div class="px-6 py-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-base font-medium text-slate-900">Sync Competition Data</h3>
							<p class="text-sm text-slate-600">Update competition data from WCA database</p>
						</div>
						<button
							onclick={syncCompetition}
							disabled={syncLoading}
							class="flex items-center space-x-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-green-400"
						>
							{#if syncLoading}
								<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
								<span>Syncing...</span>
							{:else}
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									></path>
								</svg>
								<span>Sync</span>
							{/if}
						</button>
					</div>
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
							href={resolve('/admin/[compid]/[eventid]', { compid, eventid: event.event })}
							class="group flex items-center justify-between border-b border-slate-100 pe-4 transition-colors duration-200 last:border-b-0 hover:bg-slate-50"
						>
							<!-- Left side - Event link -->
							<div class="flex flex-1 items-center space-x-4 px-5 py-4">
								<!-- Event Icon -->
								<CubeIcon event={event.event} class="scale-150" />

								<!-- Event Details -->
								<div>
									<h3
										class="text-lg font-medium text-slate-900 transition-colors duration-200 group-hover:text-blue-600"
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
									class="flex items-center space-x-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-blue-400"
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
									class="h-5 w-5 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-600"
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
