<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	const { to }: { to: ResolvedPathname } = $props();
</script>

<div class="absolute top-4 left-1">
	<!-- eslint-disable -->
	<a href={to}>
		<div
			class="flex items-center gap-2 rounded-md bg-gray-700 py-2 ps-2 pe-4 text-lg font-medium text-white shadow"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="text-white"
			>
				<path d="m15 18-6-6 6-6" />
			</svg>
			<span>Back</span>
		</div>
	</a>
</div>
