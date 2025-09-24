<script lang="ts">
	import { type WCAEvent } from '$lib/types';
	import type { ClassValue } from 'svelte/elements';
	import '../icons.css';

	const { event, class: className }: { event: WCAEvent; class?: ClassValue } = $props();
</script>

<div class="icon cubing-icon event-{event} {className}"></div>
