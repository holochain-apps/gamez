<script context="module" lang="ts">
  export type EditableBoardProps = Omit<BoardProps, 'players' | 'turn' | 'attachments' | 'pieces'>;
  export type EditableBoardState = Omit<BoardState, 'props' | 'status' | 'boundTo' | 'creator'> & {
    props: EditableBoardProps;
  };
</script>

<script lang="ts">
  import PlusIcon from '~icons/fa6-solid/plus';
  import TrashIcon from '~icons/fa6-solid/trash';
  import ArchiveIcon from '~icons/fa6-solid/box-archive';

  import { PieceDef, PieceType, type BoardProps, type BoardState } from '~/lib/store';
  import { tooltip } from '~/shared/tooltip';

  import Input from './BoardEditorInput.svelte';
  import IntegerInput from './IntegerInput.svelte';
  import PieceTypeCard from './PieceTypeCard.svelte';

  export let board: EditableBoardState;
  export let disabled: boolean = false;
  export let onSave: (newBoardState: EditableBoardState) => void;
  export let onDelete: () => void = () => {};
  export let onExport: (newBoardState: EditableBoardState) => void = () => {};
  export let onChange: (newBoardState: EditableBoardState) => void = () => {};
  export let onArchive: () => void = () => {};
  export let canDelete: boolean = false;
  export let canArchive: boolean = false;
  export let isValid: boolean = true;

  $: boardState = board;
  $: console.log('Board State updated', boardState);

  function updateBoardState<K extends keyof EditableBoardState>(
    key: K,
    value: EditableBoardState[K],
  ) {
    boardState = { ...boardState, [key]: value };
    onChange(boardState);
  }

  function updateBoardProps<K extends keyof EditableBoardProps>(
    key: K,
    value: EditableBoardProps[K],
  ) {
    updateBoardState('props', { ...boardState.props, [key]: value });
  }

  // PIECE DEFS

  function setPieceDefs(pieceDefs: Array<PieceDef>) {
    updateBoardState('pieceDefs', pieceDefs);
  }

  function addPieceDef() {
    setPieceDefs([...boardState.pieceDefs, new PieceDef(PieceType.Emoji, 'Black', 30, 30, [`🔥`])]);
  }

  function deletePieceDef(i: number) {
    setPieceDefs(boardState.pieceDefs.filter((_, index) => index !== i));
  }

  function changePieceDef(i: number, pieceDef: PieceDef) {
    console.log('Changing piece def', i, pieceDef);
    const newPieceDefs = [...boardState.pieceDefs];
    newPieceDefs[i] = pieceDef;
    setPieceDefs(newPieceDefs);
  }
</script>

<div class="flex flex-grow min-h-0">
  <div class="w-80 flex-shrink-0 bg-main-700 relative pb14">
    <div class="overflow-y-auto flex flex-col h-full p4">
      <Input
        class="block w-full mb4"
        label="Name *"
        type="text"
        value={boardState.name}
        onInput={(name) => updateBoardState('name', name)}
      />
      <div class="flex mb4 space-x-4">
        <IntegerInput
          class="w-1/2"
          label="Min players *"
          value={boardState.min_players}
          onInput={(minPlayers) => {
            updateBoardState('min_players', minPlayers);
          }}
        />
        <IntegerInput
          class="w-1/2"
          label="Max players *"
          value={boardState.max_players}
          onInput={updateBoardState.bind(null, 'max_players')}
        />
      </div>
      <label class="block mb4 cursor-pointer">
        <input type="checkbox" class="mr2" bind:checked={boardState.turns} />
        Enforce turns
      </label>
      <label class="block mb4 cursor-pointer">
        <input type="checkbox" class="mr2" bind:checked={boardState.playerPieces} />
        Players are pieces
      </label>
      <div class="mb4">
        <h3 class="font-bold text-lg mb4">Background Image</h3>
        <Input
          class="block w-full mb4"
          type="text"
          label="URL *"
          value={boardState.props.bgUrl}
          onInput={updateBoardProps.bind(null, 'bgUrl')}
        />
        <div class="flex space-x-4">
          <Input
            class="block w-1/2"
            type="number"
            label="Width"
            value={boardState.props.bgWidth}
            onInput={updateBoardProps.bind(null, 'bgWidth')}
          />
          <Input
            class="block w-1/2"
            type="number"
            label="Height"
            value={boardState.props.bgHeight}
            onInput={updateBoardProps.bind(null, 'bgHeight')}
          />
        </div>
      </div>
      <div>
        <div class="flexcc mb4">
          <h3 class="font-bold text-lg flex-grow">Pieces Types</h3>
          <button class="bg-main-500 p1 rounded-full hover:brightness-110" on:click={addPieceDef}
            ><PlusIcon /></button
          >
        </div>
        {#each boardState.pieceDefs as pieceDef, index}
          <PieceTypeCard
            def={pieceDef}
            on:delete={() => deletePieceDef(index)}
            on:change={({ detail }) => changePieceDef(index, detail)}
          />
        {/each}
      </div>
    </div>
    <div class="flex space-x-2 absolute w-full p2 h14 bg-main-400">
      {#if canDelete}
        <button
          {disabled}
          on:click={() => onDelete()}
          use:tooltip={'Delete'}
          class="bg-red-500 text-white px4 py2 rounded-md flexcc hover:brightness-120 disabled:(saturate-0 opacity-50)"
        >
          <TrashIcon />
        </button>
      {/if}
      {#if canArchive}
        <button
          {disabled}
          on:click={() => onArchive()}
          use:tooltip={'Archive'}
          class="bg-orange-500 text-white px4 py2 rounded-md flexcc hover:brightness-110 disabled:(saturate-0 opacity-50)"
        >
          <ArchiveIcon />
        </button>
      {/if}
      <button
        disabled={disabled || !isValid}
        on:click={() => onExport(boardState)}
        class="bg-yellow-500 text-white px4 py2 rounded-md flex-grow hover:brightness-110 disabled:(saturate-0 opacity-50)"
      >
        Export
      </button>
      <button
        disabled={disabled || !isValid}
        on:click={() => onSave(boardState)}
        class="bg-main-500 text-white px4 py2 rounded-md flex-grow hover:brightness-110 disabled:(saturate-0 opacity-50)"
      >
        Save
      </button>
    </div>
  </div>
  <div class="bg-main-500 flex-grow">Board Editor</div>
</div>
