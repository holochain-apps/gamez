<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
  import "@shoelace-style/shoelace/dist/components/button/button.js";
  import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog";
  
  import type {  BoardDefData } from "~/shared/store";

  let boardDef: BoardDefData| undefined;
  const dispatch = createEventDispatcher()

  let dialog: SlDialog;
  onMount(async () => {});

  export const open = async (def: BoardDefData) => {
    boardDef = def
    console.log("BOARD", def)
    text = def.board.name;
    nameInput.value = text;
    dialog.show();
  };

  const close = () => {
    dialog.hide();
  };

  const startGame = () => {
    close()
    dispatch("start-game", {name: text, boardDef})
  };

  $: valid = text != "";

  let text;
  let nameInput;
  const handleKeydown = (e) => {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "Enter" && e.ctrlKey) {
      startGame();
    } else if (e.key === "Tab") {
      // trap focus
      const tabbable = Array.from(document.querySelectorAll("input"));

      let index = tabbable.findIndex((elem) => elem == document.activeElement);

      if (index === -1 && e.shiftKey) index = 0;

      index += tabbable.length + (e.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index].focus();
      e.preventDefault();
    }
  };
</script>

<sl-dialog
  style="--width:600px"
  bind:this={dialog}
  label="Start New Game"
  class="text-black/60!"
  on:sl-initial-focus={(e)=>{
    e.preventDefault()
    nameInput.focus()
  }}
  on:sl-request-close={(event) => {
    if (event.detail.source === "overlay") {
      event.preventDefault();
    }
  }}
>
  <sl-input
    label="Name"
    maxlength="60"
    bind:this={nameInput}
    on:input={(e) => (text = e.target.value)}
  ></sl-input>
  <sl-button slot="footer" on:click={() => close()} style="margin-left:10px">
    Cancel
  </sl-button>
  <sl-button slot="footer"
    disabled={!valid}
    style="margin-left:10px"
    on:click={() => startGame()}
    variant="primary"
  >
    Start
  </sl-button>
</sl-dialog>
