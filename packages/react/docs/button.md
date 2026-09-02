# Button

## Import

```ts
import { Button } from "@yarapa-ui/react/button";
import "@yarapa-ui/react/styles.css"; // or @yarapa-ui/styles/css
```

## Usage

```tsx
<Button variant="primary" size="md">Save</Button>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| variant | "primary" \| "secondary" \| "outline" \| "ghost" | "primary" | BEM modifier class, not a data attribute |
| size | "sm" \| "md" \| "lg" | "md" | BEM modifier class, not a data attribute |
| loading | boolean | false | renders `.yp-button__spinner`, sets `disabled` + `aria-busy` |
| (native) | ButtonHTMLAttributes&lt;HTMLButtonElement&gt; | — | forwarded to the native `<button>` |

## Variants

primary, secondary, outline, ghost — the `buttonVariants()` resolver in `@yarapa-ui/styles` is the canonical prop→class mapping; `button.css` is the canonical visual implementation; the drift test enforces the two stay consistent.

## Sizes

sm (2rem), md (2.5rem), lg (3rem).

## States

`:hover`, `:focus-visible`, `:disabled`, `[aria-busy]` — native HTML only; this component uses no Base UI primitive.

## Anatomy

`.yp-button`, `.yp-button--primary` … `.yp-button--lg`, `.yp-button__spinner`.

## Accessibility

Native button semantics; `loading` sets `aria-busy` and `disabled`; spinner is `aria-hidden`.

## Styling

Append classes via `className` (applied after `buttonVariants()`); override tokens in your own cascade layer.

## Examples

```tsx
<Button variant="outline" size="sm">Cancel</Button>
<Button loading>Saving</Button>
```
