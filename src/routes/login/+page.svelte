<script lang="ts">
	import { goto } from '$app/navigation';
	import { APPLICATION_ID, redirectURI, WCA_URL } from '$lib/util';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let error = $state<string | null>(null);

	const logIn = () => {
		if (browser) {
			const url = new URL(`${WCA_URL}/oauth/authorize`);
			url.searchParams.append('client_id', APPLICATION_ID);
			url.searchParams.append('redirect_uri', redirectURI);
			url.searchParams.append('response_type', 'code');
			url.searchParams.append('scope', 'public');

			window.location.href = url.href;
		}
	};

	const handleAuthRedirect = async () => {
		if (!browser) return;

		const urlParams = new URLSearchParams(window.location.search);
		const accessCode = urlParams.get('code');

		if (accessCode) {
			try {
				const response = await fetch('/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ accessCode })
				});

				const result = await response.json();

				if (result.success) {
					goto('/home');
				} else {
					error = result.error || 'Authentication failed';
				}
			} catch (e) {
				console.error('Error during authentication:', e);
				error = 'Error during authentication process';
			}
		}
	};

	onMount(handleAuthRedirect);
</script>

<svelte:head>
	<title>WCA Pickems Login</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12"
>
	<div
		class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-md transition-shadow duration-200 hover:shadow-lg"
	>
		<!-- Main Content -->
		<h1 class="mb-4 text-3xl font-bold text-slate-800">Welcome</h1>
		<p class="mb-6 text-sm text-slate-600">Log in with your WCA account to get started.</p>

		<!-- Login Button -->
		<button
			onclick={logIn}
			class="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
		>
			<svg
				class="mr-2 h-5 w-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
				/>
			</svg>
			Log in with WCA
		</button>

		<!-- Error Message -->
		{#if error}
			<div class="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
				{error}
			</div>
		{/if}
	</div>
</div>
