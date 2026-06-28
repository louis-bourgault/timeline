<script lang="ts">
	import { TLManager } from "$lib/tlmanager.svelte";
	import { onMount, untrack } from "svelte";
    import * as Resizable from "$lib/components/ui/resizable/index.js";   
     import "./tl.css"

    let tl: HTMLDivElement

    let manager: TLManager
    onMount(() => {
        manager = new TLManager(tl)
        return () => manager.destroy()
    })



</script>
    <Resizable.PaneGroup direction="horizontal" class='flex h-full'>
        <Resizable.Pane defaultSize={75} minSize={50}>
            <div class='tl' bind:this={tl}></div>
            
          </Resizable.Pane>
          <Resizable.Handle />
          <Resizable.Pane defaultSize={25} minSize={10}>
            <div class="flex h-full items-center justify-center p-6">
              <span class="font-semibold">Content</span>
            </div>
          </Resizable.Pane>
    </Resizable.PaneGroup>
    

<style>
    .tl {
        display: flex;
        height: 100%;
        background-color:bisque;
    }
</style>