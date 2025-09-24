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

<h1>Login/Register</h1>
{#if error}
	<div>
		{error}
	</div>
{/if}

<button onclick={logIn}>Log in with WCA</button>
