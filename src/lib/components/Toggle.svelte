<script lang="ts">
	const {
		disabled,
		onclick,
		loading = false,
		value = $bindable(false),
		id
	}: {
		disabled: boolean;
		loading?: boolean;
		onclick: (e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => void;
		value?: boolean;
		id: string;
	} = $props();
</script>

<button
	{id}
	{onclick}
	{disabled}
	class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 {value
		? 'bg-blue-600'
		: 'bg-slate-200'}"
>
	<span class="sr-only">Toggle allow edits</span>
	<span
		class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {value
			? 'translate-x-5'
			: 'translate-x-0'}"
	>
		{#if loading}
			<!-- Loading spinner -->
			<span class="absolute inset-0 flex h-full w-full items-center justify-center">
				<svg class="h-3 w-3 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
				</svg>
			</span>
		{:else}
			<!-- Status indicators -->
			<span
				class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity {value
					? 'opacity-0'
					: 'opacity-100'}"
			>
				<svg class="h-3 w-3 text-slate-400" fill="currentColor" viewBox="0 0 12 12">
					<path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"></path>
				</svg>
			</span>
			<span
				class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity {value
					? 'opacity-100'
					: 'opacity-0'}"
			>
				<svg class="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
					<path
						d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
					></path>
				</svg>
			</span>
		{/if}
	</span>
</button>
