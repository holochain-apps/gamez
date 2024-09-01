declare const __APP_VERSION__: string;
declare const __DNA_VERSION__: string;

declare module 'svelte/elements' {
  interface SVGAttributes<T> {
    'data-dnd-handle'?: boolean;
  }
}
