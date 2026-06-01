# Plan: Advanced UI/UX, Accessibility, and Multi-Theme Support

Implement high-end refinements including theme switching, responsiveness, loading states, and accessibility compliance.

## Technical Details
- **Theme**: Add `next-themes` (if not present) or custom Context for Light/Dark toggle.
- **Responsiveness**: Use Sheet/Drawer for mobile navigation. Grid adjustments for tablet/mobile.
- **Accessibility**: ARIA labels, semantic HTML, contrast checks (WCAG 2.1).
- **Feedback**: Skeleton loaders and global error boundaries.

## Steps

### 1. Theme Support (Light/Dark Mode)
- Update `src/styles.css` with light-theme oklch variables.
- Refine `.glass-card` for light mode (subtle shadows, higher opacity).
- Create a `ThemeToggle` component in `AppLayout`.

### 2. Responsiveness Overhaul
- **Sidebar**: Ensure it transforms into a mobile drawer/sheet on small screens.
- **Dashboard**: Ensure charts scale and stack.
- **Tables**: Wrap tables in responsive containers and optimize for mobile cards.
- **Header**: Adjust layout for narrow viewports.

### 3. Loading & Error States
- Create `LoadingSkeleton` for stats and charts.
- Implement `ErrorBoundary` component.
- Add "Empty States" with illustrations for pages without data.

### 4. Accessibility & Audit
- Add `aria-label` to all icon-only buttons.
- Ensure correct heading hierarchy (H1, H2, etc.).
- Improve keyboard focus indicators (visible orange rings).
- Contrast: Ensure orange `#FF6B00` on white and black meets accessibility standards (or adjust for light mode).

### 5. Regression & Consistency
- Add a "Design System" page (internal) to preview components in all states.
- Standardize spacing using Tailwind's `space-y-X` and `gap-X`.
