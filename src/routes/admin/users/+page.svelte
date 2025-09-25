<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import BackButton from '$lib/components/BackButton.svelte';
	import { PAGINATION_SIZE } from '$lib/util';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	let currentPage = $state(data.currentPage);

	let totalUsers = $state(data.total[0].count);
	let totalPages = $state(Math.ceil(totalUsers / PAGINATION_SIZE));
	let hasMorePages = $state(currentPage + 1 < totalPages);
	let isFirstPage = $state(currentPage === 0);

	const nextPage = () => {
		const url = new URL(page.url);

		url.searchParams.set('page', String(currentPage + 1));

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url);
	};

	const prevPage = () => {
		if (!isFirstPage) {
			const url = new URL(page.url);
			url.searchParams.set('page', String(currentPage - 1));
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(url);
		}
	};
</script>

<svelte:head>
	<title>Admin - User List</title>
</svelte:head>

<BackButton to={resolve('/admin')} />
<div class="container mx-auto p-4">
	<h1 class="mt-2 mb-6 text-center text-3xl font-bold">All Users</h1>

	{#if data.users && data.users.length > 0}
		<div class="overflow-x-auto rounded-lg bg-white shadow-md">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Name
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							WCA ID
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Admin
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each data.users as user (user.id)}
						<tr class="transition-colors hover:bg-gray-100">
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="font-medium text-gray-900">{user.name}</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm text-gray-500">
									{user.wcaId ?? 'N/A'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if user.isAdmin}
									<span
										class="inline-flex rounded-full bg-green-100 px-2 text-xs leading-5 font-semibold text-green-800"
									>
										Yes
									</span>
								{:else}
									<span
										class="inline-flex rounded-full bg-red-100 px-2 text-xs leading-5 font-semibold text-red-800"
									>
										No
									</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if totalPages > 1}
			<div class="mt-8 flex items-center justify-between">
				<button
					class="rounded-md border px-4 py-2 font-semibold transition-colors duration-200
                           {!isFirstPage
						? 'bg-blue-600 text-white hover:bg-blue-700'
						: 'cursor-not-allowed bg-gray-200 text-gray-500'}"
					onclick={prevPage}
					disabled={isFirstPage}
				>
					Previous
				</button>
				<span class="text-sm text-gray-700">Page {currentPage + 1} of {totalPages}</span>
				<button
					class="rounded-md border px-4 py-2 font-semibold transition-colors duration-200
                           {hasMorePages
						? 'bg-blue-600 text-white hover:bg-blue-700'
						: 'cursor-not-allowed bg-gray-200 text-gray-500'}"
					onclick={nextPage}
					disabled={!hasMorePages}
				>
					Next
				</button>
			</div>
		{/if}
	{:else}
		<p class="text-center text-gray-600">No users found.</p>
	{/if}
</div>
