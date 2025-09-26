<script lang="ts">
	import { formatDate } from '$lib/util';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>WCA Pickems</title>
	<meta name="description" content="Predict the winners of WCA Competitions" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br">
	<div class="mx-auto max-w-5xl px-4 py-12">
		<div class="mb-10 flex items-center justify-between">
			<h1 class="text-4xl font-bold text-slate-800">Competitions</h1>
			<a
				href={resolve('/login')}
				class="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				Login
			</a>
		</div>

		{#if data.competitions && data.competitions.length > 0}
			<div class="space-y-4">
				{#each data.competitions as competition (competition.id)}
					<div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
						<a
							href={resolve('/[compid]/leaderboard', { compid: competition.competitionId })}
							class="block px-6 py-4"
						>
							<div class="flex items-start justify-between">
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

								<div class="flex flex-wrap gap-3">
									<div class="flex flex-row items-center">
										<div>
											<div
												class="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
											>
												Active
											</div>
										</div>
									</div>
								</div>
							</div>
						</a>
					</div>
				{/each}
			</div>
		{:else}
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
			</div>
		{/if}
	</div>
</div>
