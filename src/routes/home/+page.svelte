<script lang="ts">
	import { formatDate } from '$lib/util';
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>WCA Pickems Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br">
	<div class="mx-auto max-w-5xl px-4 py-12">
		<!-- Header Section -->
		<div class="relative mb-8">
			<h1 class="mb-2 text-center text-3xl font-bold text-gray-900">Competitions</h1>
			<form method="POST" action="?/logout">
				<button
					class="text-md absolute top-1/2 right-0 inline-flex -translate-y-1/2 items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					Logout
				</button>
			</form>
		</div>

		<!-- Competitions List -->
		{#if data.competitions && data.competitions.length > 0}
			<div class="space-y-4">
				{#each data.competitions as competition (competition.id)}
					{@const resolvePath = { compid: competition.competitionId }}
					<div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
						<div class="p-6">
							<!-- Competition Header -->
							<div class="mb-4 flex items-start justify-between">
								<div>
									<h2 class="text-xl font-semibold text-slate-900">
										{competition.competitionName}
									</h2>
									<p class="mt-1 flex items-center text-sm text-slate-500">
										<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											></path>
										</svg>
										{formatDate(competition.startDate)}
									</p>
								</div>

								<!-- Competition Status Badge -->
								<div class="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
									Active
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="flex flex-wrap gap-3">
								<a
									href={resolve('/[compid]', resolvePath)}
									class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
								>
									<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										></path>
									</svg>
									Make Predictions
								</a>

								<a
									href={resolve('/[compid]/leaderboard', resolvePath)}
									class="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100"
								>
									<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										></path>
									</svg>
									Leaderboard
								</a>
							</div>
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
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						></path>
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-medium text-slate-700">No Competitions Available</h3>
				<p class="text-slate-500">There are currently no competitions available for predictions.</p>
			</div>
		{/if}
	</div>
</div>
