---
name: framer-motion
description: Best practices for Framer Motion animation library. Use when adding declarative animations to React components, implementing layout transitions, exit/enter animations, complex gestures, or glassmorphism UI popups.
---

# Framer Motion Best Practices

Framer Motion is a production-ready declarative animation library for React that simplifies layout animations, gestures, and complex UI transitions.

### 1. The `motion` Component

Always use `motion.<tag>` (e.g., `<motion.div>`, `<motion.button>`) for animatable elements.
- Basic usage involves `initial` (starting state) and `animate` (target state).

```tsx
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  Hello World
</motion.div>
```

### 2. AnimatePresence for Mount/Unmount

For components that appear or disappear from the DOM (like modals, glassmorphism overlays, dropdowns), wrap the conditional block in `<AnimatePresence>`.
- Use the `exit` prop on the nested `motion` element to define the unmount animation.

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      Modal Content
    </motion.div>
  )}
</AnimatePresence>
```

### 3. Variants

For complex animations or stagger effects on lists of children, use `variants`.
- Variants clean up the JSX and promote reusability.
- Provide string references (keys) defined in the variants object to `initial`, `animate`, and `exit` props.

### 4. Layout Animations

Framer Motion shines at interpolating layout changes seamlessly.
- Simply add the `layout` prop to a `motion` component if its size or position changes due to CSS (e.g., flex-direction changes) or state updates.

### 5. Transition Settings

Use the `transition` prop to tweak spring physics or duration.
- Example: `transition={{ type: "spring", stiffness: 100, damping: 10 }}`
- Prefer spring physics over linear easing for a more natural, modern UI feel.
