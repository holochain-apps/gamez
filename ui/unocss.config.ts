// Add textShadow
import transformerVariantGroup from '@unocss/transformer-variant-group';
import { defineConfig, presetTypography, presetUno } from 'unocss';

const FLEX_ALIGNS = {
  c: 'center',
  e: 'flex-end',
  s: 'flex-start',
  _: 'stretch',
};

export default defineConfig({
  presets: [presetUno(), presetTypography()],
  transformers: [transformerVariantGroup()],
  rules: [
    [
      /^flex([cse_])([cse_])$/,
      ([, c1, c2]) => ({
        display: 'flex',
        'align-items': FLEX_ALIGNS[c1],
        'justify-content': FLEX_ALIGNS[c2],
      }),
    ],
  ],
  variants: [
    (matcher) => {
      if (!matcher.startsWith('hocus:')) return matcher;

      return {
        // slice `hover:` prefix and passed to the next variants and rules
        matcher: matcher.slice(6),
        selector: (s) => `${s}:hover, ${s}:focus`,
      };
    },
    (matcher) => {
      const variant = 'placeholder-shown';
      if (!matcher.includes(variant)) return matcher;
      const isNot = matcher.startsWith('not-');
      return {
        // slice `hover:` prefix and passed to the next variants and rules
        matcher: isNot ? matcher.slice(variant.length + 5) : matcher.slice(variant.length + 1),
        selector: (input) =>
          isNot ? `${input}:not(:placeholder-shown)` : `${input}:placeholder-shown`,
      };
    },
  ],
  theme: {
    breakpoints: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    colors: {
      main: (() => {
        let colors: [string, string][] = [];
        for (let i = 5; i <= 100; i += 5) {
          colors.push([`${i}0`, `hsl(var(--main-hue), var(--main-saturation), ${i}%)`]);
        }
        return Object.fromEntries(colors);
      })(),
    },
  },
});
