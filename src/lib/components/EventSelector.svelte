<script lang="ts">
	import { type WCAEvent, WCAEvents } from '$lib/types';
	import CubeIcon from './CubeIcon.svelte';

	let { event: selectedEvent = $bindable() }: { event: WCAEvent | null } = $props();
</script>

<div class="event-selector-wrapper">
	<div class="button-container">
		<button
			class="event-button all-events-button"
			class:active={selectedEvent === null}
			onclick={() => (selectedEvent = null)}
		>
			All Events
		</button>

		{#each WCAEvents as event (event)}
			<button
				class="event-button icon-button"
				class:active={event === selectedEvent}
				onclick={() => (selectedEvent = event)}
				title={event}
			>
				<CubeIcon {event} class="event-icon" />
			</button>
		{/each}
	</div>
</div>

<style>
	.event-selector-wrapper {
		background-color: #fff;
		border-radius: 0.5rem;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
		border: 1px solid #e5e7eb;
		padding: 1rem;
	}

	.button-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.event-button {
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		background-color: #fff;
		color: #374151;
		transition: all 200ms;
		cursor: pointer;

		--icon-color: #4b5563;
	}

	.event-button:not(.active):hover {
		background-color: #e5e7eb;
	}

	.event-button.active {
		background-color: #3b82f6;
		color: #fff;
		border-color: #3b82f6;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
		--icon-color: #fff;
	}

	.all-events-button {
		padding: 0.5rem 1rem;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.icon-button {
		padding: 0.5rem 1rem;
	}

	:global(.event-icon) {
		transform: scale(1.25);
		color: var(--icon-color);
		display: block;
	}
</style>
