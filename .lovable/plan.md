I will implement the InfraFlow platform with a focus on a premium engineering aesthetic, including a comprehensive sidebar navigation, a detailed dashboard, and specialized technical modules.

### Design System
- Update `src/styles.css` with InfraFlow's specific color palette:
  - Dark mode as default: Graphite black (#121212), Deep charcoal (#1E1E1E).
  - Primary Highlight: Engineering Orange (#FF6B00).
  - Secondary: Technical Blue (#0066CC).
  - Text: Soft white (#E0E0E0).

### Navigation & Layout
- Create a `Layout` component using the `Sidebar` component from shadcn/ui.
- Implement the 13-item sidebar with modern icons (Dashboard, Technical AI, Budgeting, etc.).

### Dashboard (Main View)
- Top summary cards: Works in progress, Generated budgets, Active projects, Technical alerts, Estimated time savings.
- Charts: Using `recharts` for financial evolution and costs by project.
- Recent activity feed and right-hand utility panel (Weather, Technical updates).

### Technical Modules (Structure)
- **Technical AI Assistant**: ChatGPT-style interface with engineering-specific quick actions.
- **Budgeting Module**: 5-step guided wizard for road infrastructure calculation.
- **GIS Map**: Interactive map placeholder using Lucide icons or a basic MapLibre integration if feasible (initially a high-fidelity visual representation).
- **Other Modules**: Placeholder views for As-Built, Memorial, Standards, Measurements, and Financials.

### Implementation Steps
1. **Core Styles**: Define the engineering theme in CSS.
2. **Main Layout**: Refactor `__root.tsx` to include the sidebar and global layout.
3. **Dashboard Implementation**: Create the rich landing view in `src/routes/index.tsx`.
4. **Route Structure**: Generate placeholders for all sidebar modules to ensure navigation works.
5. **Technical AI & Budgeting**: Build the interactive components for these key features.

Technical Details:
- Framework: React with TanStack Router.
- Styling: Tailwind CSS 4.0.
- Icons: Lucide React.
- Animation: Framer Motion.
- Components: Shadcn/ui (already present).
