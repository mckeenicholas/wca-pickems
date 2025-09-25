<script lang="ts">
	import EventSelector from '$lib/components/EventSelector.svelte';
	import type { WCAEvent } from '$lib/types';
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const { data }: PageProps = $props();

	const userIsLoggedIn = !!data.userRank;

	let selectedEvent: WCAEvent | null = $state(
		(page.url.searchParams.get('event') as WCAEvent) || null
	);

	function handleEventChange(event: WCAEvent | null) {
		selectedEvent = event;

		const url = new URL(page.url);

		if (event) {
			url.searchParams.set('event', event);
		} else {
			url.searchParams.delete('event');
		}

		url.searchParams.delete('page');

		goto(url, { replaceState: false });
	}

	function goToPage(pageNum: number) {
		const url = new URL(page.url);
		if (pageNum > 0) {
			url.searchParams.set('page', pageNum.toString());
		} else {
			url.searchParams.delete('page');
		}
		goto(url, { replaceState: false });
	}

	function getRankingClasses(rank: number): string {
		if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
		if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
		if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
		return 'bg-white border-gray-200';
	}
</script>

<svelte:head>
	<title>Pickems Leaderboard for {data.compName}</title>
</svelte:head>

<div class="mx-auto max-w-[75vw] space-y-6 p-4">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-3xl font-bold text-gray-700">
			Predictions Leaderboard for {data.compName}
		</h1>
	</div>

	<EventSelector
		bind:event={() => selectedEvent, (event) => handleEventChange(event)}
		eventOptions={data.events}
	/>

	{#if userIsLoggedIn}
		<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
			<h3 class="mb-2 text-lg font-semibold text-blue-900">Your Performance</h3>
			<div class="flex items-center justify-between">
				<div>
					<span class="text-sm text-blue-700">Rank: </span>
					<span class="font-bold text-blue-900">#{data.userRank}</span>
				</div>
				<div>
					<span class="text-sm text-blue-700">Score: </span>
					<span class="font-bold text-blue-900">{Number(data.userScore).toFixed(2)}</span>
				</div>
				{#if data.userPercentile}
					<div>
						<span class="text-sm text-blue-700">Top </span>
						<span class="font-bold text-blue-900">{(100 - data.userPercentile).toFixed(1)}%</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Leaderboard Results -->
	{#if data.leaderboardResults && data.leaderboardResults.length > 0}
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<!-- Header Row -->
			<div class="border-b border-gray-200 bg-gray-50 px-4 py-2">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900">Rankings</h2>
					<span class="text-sm text-gray-500">
						{data.totalUsers} total participants
					</span>
				</div>
			</div>

			<!-- Results List -->
			<div class="divide-y divide-gray-100">
				{#each data.leaderboardResults as result, idx (result.userName)}
					<div
						class="border-l-4 px-4 py-2 transition-colors duration-150 hover:bg-gray-50 {getRankingClasses(
							parseInt(result.rank)
						)}"
					>
						<div class="flex items-center justify-between">
							<!-- Rank and User Info -->
							<div class="flex items-center space-x-2">
								<div class="flex items-center">
									<!-- Rank Number -->
									<span class="min-w-[3rem] text-center text-2xl font-bold text-gray-700">
										{result.rank ?? idx + 1}
									</span>
								</div>

								<!-- User Name -->
								<div>
									<h3 class="text-lg font-semibold text-gray-900">
										{result.userName}
									</h3>
								</div>
							</div>

							<!-- Score -->
							<div class="text-right">
								<div class="text-2xl font-bold text-blue-600">
									{Number(result.score).toFixed(2)}
								</div>
								<div class="text-sm text-gray-500">points</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Pagination Info -->
		{#if data.totalPages > 1}
			<div class="flex items-center justify-center space-x-2 pt-2">
				<span class="text-sm text-gray-600">
					Page {data.currentPage + 1} of {data.totalPages}
				</span>

				<!-- Pagination buttons -->
				<div class="flex space-x-2">
					{#if data.currentPage > 0}
						<button
							class="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
							onclick={() => goToPage(data.currentPage - 1)}
						>
							Previous
						</button>
					{/if}

					{#if data.currentPage < data.totalPages - 1}
						<button
							class="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
							onclick={() => goToPage(data.currentPage + 1)}
						>
							Next
						</button>
					{/if}
				</div>
			</div>
		{/if}
	{:else if data.noPredictions}
		<!-- No Predictions State -->
		<div class="rounded-lg border border-gray-200 bg-white py-12 text-center shadow-sm">
			<div class="mb-4 text-gray-400">
				<svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
					/>
				</svg>
			</div>
			<h3 class="mb-2 text-lg font-medium text-gray-900">No Predictions Yet</h3>
			<p class="text-gray-600">
				No predictions have been made for this {selectedEvent
					? `event (${selectedEvent})`
					: 'competition'} yet.
			</p>
		</div>
	{:else}
		<!-- Empty State -->
		<div class="rounded-lg border border-gray-200 bg-white py-12 text-center shadow-sm">
			<div class="mb-4 text-gray-400">
				<svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					/>
				</svg>
			</div>
			<h3 class="mb-2 text-lg font-medium text-gray-900">No Results</h3>
			<p class="text-gray-600">No leaderboard data available for this competition.</p>
		</div>
	{/if}
</div>
