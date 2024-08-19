<script lang="ts">
  import PlusIcon from '~icons/fa6-solid/plus';
  import { PieceDef, PieceType, type BoardProps } from '~/lib/store';
  import Input from './BoardEditorInput.svelte';
  import PieceTypeCard from './PieceTypeCard.svelte';

  const generateBlankBoardProps = (): BoardProps => ({
    bgUrl: '',
    pieces: {},
    players: [],
    attachments: [],
    turn: 0,
    bgHeight: '',
    bgWidth: '',
  });

  const state = {};

  let pieceDefs: Array<PieceDef> = [];

  function addPieceDef() {
    pieceDefs = [...pieceDefs, new PieceDef(PieceType.Emoji, 'Black', 30, 30, [`🔥`])];
  }

  function deletePieceDef(i: number) {
    pieceDefs = pieceDefs.filter((_, index) => index !== i);
  }

  function changePieceDef(i: number, pieceDef: PieceDef) {
    console.log('Changing piece def', i, pieceDef);
    const newPieceDefs = [...pieceDefs];
    newPieceDefs[i] = pieceDef;
    pieceDefs = newPieceDefs;
  }
</script>

<div class="flex flex-grow min-h-0">
  <div class="w-80 flex-shrink-0 bg-main-700 relative pb14">
    <div class="overflow-y-auto flex flex-col h-full p4">
      <Input class="block w-full mb4" label="Name *" type="text" />
      <div class="flex mb4 space-x-4">
        <Input class="w-1/2" label="Min players" type="number" />
        <Input class="w-1/2" label="Max players" type="number" />
      </div>
      <label class="block mb4 cursor-pointer">
        <input type="checkbox" class="mr2" />
        Enforce turns
      </label>
      <label class="block mb4 cursor-pointer">
        <input type="checkbox" class="mr2" />
        Players are pieces
      </label>
      <div class="mb4">
        <h3 class="font-bold text-lg mb4">Background Image</h3>
        <Input class="block w-full mb4" type="text" label="URL *" />
        <div class="flex space-x-4">
          <Input class="block w-1/2" type="number" label="Width *" />
          <Input class="block w-1/2" type="number" label="Height *" />
        </div>
      </div>
      <div>
        <div class="flexcc mb4">
          <h3 class="font-bold text-lg flex-grow">Pieces Types</h3>
          <button class="bg-main-500 p1 rounded-full hover:brightness-110" on:click={addPieceDef}
            ><PlusIcon /></button
          >
        </div>
        {#each pieceDefs as pieceDef, index}
          <PieceTypeCard
            def={pieceDef}
            on:delete={() => deletePieceDef(index)}
            on:change={({ detail }) => changePieceDef(index, detail)}
          />
        {/each}
      </div>
    </div>
    <div class="flex space-x-4 absolute w-full p2 h14 bg-main-400">
      <button class="bg-red-500 text-white px4 py2 rounded-md flex-1 hover:brightness-120">
        Delete
      </button>
      <button class="bg-orange-500 text-white px4 py2 rounded-md flex-1 hover:brightness-110">
        Archive
      </button>
      <button class="bg-main-500 text-white px4 py2 rounded-md flex-1 hover:brightness-110">
        Save
      </button>
    </div>
  </div>
  <div class="bg-main-500 flex-grow">Board Editor</div>
</div>
