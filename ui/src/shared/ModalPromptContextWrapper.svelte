<script context="module" lang="ts">
  import { getContext } from 'svelte';

  export type ModalPromptProps = {
    title: string;
    placeholder: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
  };

  export function getModalPromptContext() {
    return getContext('modalPrompt') as {
      open: (props: ModalPromptProps) => void;
      close: () => void;
    };
  }
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import ModalPrompt from './ModalPrompt.svelte';

  let modalPromptProps: ModalPromptProps | null = null;

  function open(props: ModalPromptProps) {
    modalPromptProps = props;
  }

  function close() {
    modalPromptProps = null;
  }

  function handleConfirm(value: string) {
    modalPromptProps!.onConfirm(value);
    close();
  }

  setContext('modalPrompt', { open, close });
</script>

{#if modalPromptProps}
  <ModalPrompt {...modalPromptProps} onConfirm={handleConfirm} onCancel={close} />
{/if}
<slot />
