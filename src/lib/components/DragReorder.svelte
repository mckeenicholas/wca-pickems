<script lang="ts">
	import { MAX_PICKS } from '$lib/util';

	let {
		top8List = $bindable(),
		bankList = $bindable(),
		freeze = false,
		results = false
	}: {
		top8List: { name: string }[];
		bankList: { name: string }[];
		freeze?: boolean;
		results?: boolean;
	} = $props();

	let searchTerm = $state('');

	let draggingIndex = $state(-1);
	let draggingFromList = $state<'top8' | 'bank' | null>(null);
	let overIndex = $state(-1);
	let dragOverList = $state<'top8' | 'bank' | null>(null);
	let isDraggingAfter = $state(false);

	function handleDragStart(event: DragEvent, index: number, listName: 'top8' | 'bank'): void {
		if (freeze) return;
		draggingIndex = index;
		draggingFromList = listName;
		event.dataTransfer?.setData('text/plain', 'dragging');
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDragOver(event: DragEvent, index: number, listName: 'top8' | 'bank'): void {
		if (freeze) return;
		event.preventDefault();
		event.stopPropagation();

		overIndex = index;
		dragOverList = listName;

		const targetElement = event.currentTarget as HTMLElement;
		const rect = targetElement.getBoundingClientRect();
		isDraggingAfter = event.clientY > rect.top + rect.height / 2;
	}

	function handleDragOverContainer(event: DragEvent, listName: 'top8' | 'bank'): void {
		if (freeze) return;
		event.preventDefault();
		overIndex = -1;
		dragOverList = listName;
	}

	function handleDrop(event: DragEvent, listName: 'top8' | 'bank', index: number | null): void {
		if (freeze || draggingFromList === null || draggingIndex === -1) {
			resetDragState();
			return;
		}
		event.preventDefault();
		event.stopPropagation();

		const sourceList = draggingFromList === 'top8' ? top8List : bankList;
		const destinationList = listName === 'top8' ? top8List : bankList;

		if (listName === 'top8' && destinationList.length >= MAX_PICKS && draggingFromList === 'bank') {
			resetDragState();
			return;
		}

		let dropIndex: number;
		if (index !== null) {
			const targetElement = event.currentTarget as HTMLElement;
			const rect = targetElement.getBoundingClientRect();
			const isAfter = event.clientY > rect.top + rect.height / 2;
			dropIndex = isAfter ? index + 1 : index;
		} else {
			dropIndex = destinationList.length;
		}

		const [draggedItem] = sourceList.splice(draggingIndex, 1);

		if (sourceList === destinationList && draggingIndex < dropIndex) {
			dropIndex--;
		}

		destinationList.splice(dropIndex, 0, draggedItem);

		resetDragState();
	}

	function resetDragState(): void {
		draggingIndex = -1;
		overIndex = -1;
		draggingFromList = null;
		dragOverList = null;
		isDraggingAfter = false;
	}

	function handleDragEnd(): void {
		resetDragState();
	}
</script>

<div class="container">
	<div class="column">
		<h2 class="title-competitors">Competitors</h2>

		<input
			type="search"
			id="competitor-search"
			bind:value={searchTerm}
			placeholder="Search competitors..."
			class="search-input"
		/>

		<div
			class="list-container"
			class:drag-over={!freeze && dragOverList === 'bank'}
			ondragover={(e) => handleDragOverContainer(e, 'bank')}
			ondrop={(e) => handleDrop(e, 'bank', null)}
			role="listbox"
			tabindex="0"
		>
			{#if bankList.length === 0}
				<div class="placeholder">All items placed</div>
			{/if}
			{#each bankList as item, index (item.name)}
				{#if item.name.toLowerCase().includes(searchTerm.toLowerCase())}
					{#if !freeze && overIndex === index && dragOverList === 'bank' && !isDraggingAfter}
						<div class="drop-indicator"></div>
					{/if}
					<div
						class="card"
						class:frozen={freeze}
						class:is-dragging={draggingIndex === index && draggingFromList === 'bank'}
						draggable={!freeze}
						ondragstart={(e) => handleDragStart(e, index, 'bank')}
						ondragover={(e) => handleDragOver(e, index, 'bank')}
						ondrop={(e) => handleDrop(e, 'bank', index)}
						ondragend={handleDragEnd}
						role="option"
						aria-selected="false"
						tabindex="0"
					>
						<span class="name">{item.name}</span>
					</div>
					{#if !freeze && overIndex === index && dragOverList === 'bank' && isDraggingAfter}
						<div class="drop-indicator"></div>
					{/if}
				{/if}
			{/each}
		</div>
	</div>

	<div class="column">
		<h2 class="title-predictions">{results ? 'Results' : 'Predictions'}</h2>
		<div
			class="list-container"
			class:drag-over={!freeze && dragOverList === 'top8'}
			ondragover={(e) => handleDragOverContainer(e, 'top8')}
			ondrop={(e) => handleDrop(e, 'top8', null)}
			role="listbox"
			tabindex="0"
		>
			{#if top8List.length === 0}
				<div class="placeholder">
					Place {results ? 'results' : 'predictions'} here in order (max {MAX_PICKS})
				</div>
			{/if}
			{#each top8List as item, index (item.name)}
				{#if !freeze && overIndex === index && dragOverList === 'top8' && !isDraggingAfter}
					<div class="drop-indicator"></div>
				{/if}
				<div
					class="card"
					class:frozen={freeze}
					class:is-dragging={draggingIndex === index && draggingFromList === 'top8'}
					draggable={!freeze}
					ondragstart={(e) => handleDragStart(e, index, 'top8')}
					ondragover={(e) => handleDragOver(e, index, 'top8')}
					ondrop={(e) => handleDrop(e, 'top8', index)}
					ondragend={handleDragEnd}
					role="option"
					aria-selected="false"
					tabindex="0"
				>
					<span class="rank">{index + 1}.</span>
					<span class="name">{item.name}</span>
				</div>
				{#if !freeze && overIndex === index && dragOverList === 'top8' && isDraggingAfter}
					<div class="drop-indicator"></div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style>
	.container {
		font-family: sans-serif;
		display: flex;
		flex-direction: row;
		gap: 1.5rem;
		padding: 1.5rem;
		width: 100%;
		max-width: 56rem;
		margin: auto;
	}

	.column {
		flex: 1;
	}

	.title-competitors {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #374151;
	}

	.title-predictions {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 74px;
		color: #374151;
	}

	.search-input {
		width: 100%;
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-size: 1rem;
		box-sizing: border-box;
	}
	.search-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px #bfdbfe;
	}

	.list-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border: 2px dashed #d1d5db;
		border-radius: 0.75rem;
		min-height: 75vh;
		background-color: #f9fafb;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}

	.list-container.drag-over {
		background-color: #eff6ff;
		border-color: #60a5fa;
	}

	.placeholder {
		color: #9ca3af;
		text-align: center;
		padding-top: 2.5rem;
		padding-bottom: 2.5rem;
		font-style: italic;
	}

	.card {
		background-color: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 0.75rem;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
		transition: all 0.2s ease-in-out;
		position: relative;
		color: #374151;
		display: flex;
		align-items: center;
		cursor: grab;
	}

	.frozen {
		cursor: pointer !important;
	}

	.card:hover {
		border-color: #d1d5db;
		background-color: #f1f5f9;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
	}

	.card.is-dragging {
		opacity: 0.5;
		transform: scale(0.95);
		box-shadow: 0 0 0 2px #3b82f6;
	}

	.rank {
		font-weight: 600;
		color: #1f2937;
	}

	.name {
		margin-left: 0.5rem;
	}

	.drop-indicator {
		height: 4px;
		background-color: #60a5fa;
		border-radius: 2px;
		margin-top: -6px;
		margin-bottom: -6px;
	}
</style>
