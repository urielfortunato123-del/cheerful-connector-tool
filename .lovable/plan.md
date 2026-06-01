# Plan: UI/UX Premium Overhaul - InfraFlow

Upgrade the entire application to a high-end, modern "Glassmorphism Dark" theme as requested by the user's reference images.

## Technical Details
- **Theme**: Dark mode by default with oklch colors.
- **Components**: shadcn/ui with custom glassmorphism styles.
- **Icons**: Lucide React.
- **Charts**: Recharts with custom styling (gradients, glows).

## Steps

### 1. Global Styles Refresh
Update `src/styles.css` with:
- Improved `.glass-card` with multiple shadow layers.
- Custom gradient text and background utilities.
- Sidebar "glow" and active state enhancements.
- Animated background patterns.

### 2. Layout & Navigation (AppLayout.tsx)
- Refine the sidebar with better spacing and grouping.
- Add a profile/user section in the footer.
- Improve the header with a "Search" bar and cleaner project selector.
- Add a subtle border glow to the sidebar.

### 3. Dashboard Upgrade (index.tsx)
- Replace simple stat cards with "Metric Cards" featuring mini-sparklines.
- Implement a primary "Performance Over Time" area chart with smooth curves.
- Add a "Circular Activity" chart for task distribution.
- Redesign the AI Assistant section to be more compact and integrated.
- Add a "Recent Activities" feed.

### 4. Financial Page Polish (financial.tsx)
- Align with the new premium cards.
- Improve the transaction list with better status indicators.
- Add a "Budget Health" indicator.

### 5. Projects Page Polish (projects.tsx)
- Better project cards with progress bars for each highway section.
- Improved search and filtering UI.

### 6. Final Polish & Performance
- Add micro-animations (framer-motion if available, or Tailwind transitions).
- Ensure responsiveness across all screen sizes.
