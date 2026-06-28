<script lang="ts">
	import { TLManager } from "$lib/tlmanager.svelte";
	import { onMount } from "svelte";
    import "./tl.css"

    let tl: HTMLDivElement

    let manager: TLManager
    onMount(() => {
        manager = new TLManager(tl)
    })
</script>

<div>

    <div class='tl' bind:this={tl}></div>

</div>

<style>
    .tl {
        position: relative;
        width: 500px;
        height: 500px;
        background-color:bisque;
    }

    
    
</style>