<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-4xl px-6 py-8">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="mb-2 text-3xl font-bold text-gray-900">Competition Management</h1>
			<a
				href="/admin/users"
				class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				View Users
			</a>
		</div>

		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-4 flex items-center">
				<h2 class="text-xl font-semibold text-gray-900">Import New Competition</h2>
			</div>

			<form method="POST" use:enhance class="space-y-6">
				<div>
					<label for="compId" class="mb-2 block text-sm font-medium text-gray-700">
						Competition ID
					</label>
					<div class="relative">
						<input
							id="compId"
							name="compId"
							type="text"
							class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
				</div>

				<button
					type="submit"
					class="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
						></path>
					</svg>
					<span>Import Competition</span>
				</button>
			</form>
		</div>

		{#if data.availableCompetitions && data.availableCompetitions.length > 0}
			<div class="rounded-lg border border-gray-200 bg-white shadow-sm">
				<div class="border-b border-gray-200 px-6 py-4">
					<div class="flex items-center">
						<div class="mr-3 rounded-lg bg-green-100 p-2">
							<svg
								class="h-5 w-5 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								></path>
							</svg>
						</div>
						<div>
							<h2 class="text-xl font-semibold text-gray-900">Available Competitions</h2>
							<p class="mt-1 text-sm text-gray-600">
								{data.availableCompetitions.length} competition{data.availableCompetitions
									.length === 1
									? ''
									: 's'} available
							</p>
						</div>
					</div>
				</div>

				<div class="divide-y divide-gray-100">
					{#each data.availableCompetitions as competition, index (competition.id)}
						<div class="group px-6 py-4 transition-colors duration-150 hover:bg-gray-50">
							<a
								href="/admin/{competition.competitionId}"
								class="flex w-full items-center justify-between"
							>
								<div class="flex items-center space-x-4">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 transition-colors duration-150 group-hover:bg-blue-100 group-hover:text-blue-600"
									>
										{index + 1}
									</div>

									<div>
										<h3
											class="text-lg font-medium text-gray-900 transition-colors duration-150 group-hover:text-blue-600"
										>
											{competition.competitionName}
										</h3>
										<p class="mt-1 text-sm text-gray-500">
											ID: {competition.competitionId}
										</p>
									</div>
								</div>

								<div class="text-gray-400 transition-colors duration-150 group-hover:text-blue-600">
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			</div>
		{:else}
			<div class="rounded-lg border border-gray-200 bg-white py-12 text-center shadow-sm">
				<div class="mb-4 text-gray-400">
					<svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						/>
					</svg>
				</div>
				<h3 class="mb-2 text-lg font-medium text-gray-900">No Competitions Yet</h3>
				<p class="text-gray-600">
					Import your first competition using the form above to get started.
				</p>
			</div>
		{/if}
	</div>
</div>
