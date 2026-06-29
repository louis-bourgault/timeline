<script lang="ts">
	import { TLManager } from '$lib/tlmanager.svelte';
	import { onMount } from 'svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import './tl.css';

	let tl: HTMLDivElement;

	let manager: TLManager | undefined = $state();
	onMount(() => {
		manager = new TLManager(tl);
		return () => {if (manager) {manager.destroy();}}
	});
</script>

<Resizable.PaneGroup direction="horizontal" class="flex h-full">
	<Resizable.Pane defaultSize={75} minSize={50}>
		<div class="tl" bind:this={tl}></div>
	</Resizable.Pane>
	<Resizable.Handle />
	<Resizable.Pane defaultSize={25} minSize={10}>
		<div class=" h-full  justify-center p-3">
    <h2 class='text-2xl text-primary'>Events</h2>
			{#if manager}
				{#each manager.events as event (event.id)}
					<div class="w-full bg-card min-h-4 border-card-foreground border-2 py-2 my-2">
						<p>{event.title}</p>
					</div>
				{/each}
			{/if}
		</div>
	</Resizable.Pane>
</Resizable.PaneGroup>

<style>
	.tl {
		display: flex;
		height: 100%;
		background-color: bisque;
	}
</style>
