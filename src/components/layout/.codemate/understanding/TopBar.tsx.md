

TopBar Component Documentation

Overview
This file defines a reusable header component named TopBar designed for a secure vault application. It manages the top navigation area, including search functionality, security status, and action buttons. The component is built for a client-side environment using React and Next.js conventions.

Key Features
- Sticky Header: Remains fixed at the top of the viewport with a glassmorphism effect (backdrop blur).
- Search Input: Animated search bar that expands in width and changes border color when focused.
- Vault Status: Displays whether the vault is locked or unlocked by consuming the useVault store.
- Action Button: Optional animated button to create new items, utilizing Framer Motion for scale effects on hover and tap.

Component Structure

1. TopBar (Main Component)
   - Props:
     - title: String displayed as the page header.
     - onNewItem: Optional callback function triggered when the new item button is clicked.
     - newItemLabel: Optional string for the button text (defaults to "New").
   - State: Manages the search query string and the focus state of the search input.
   - Dependencies: Uses framer-motion for button animations, lucide-react for icons (Search, Plus), and a custom store for vault state.

2. VaultStatus (Internal Component)
   - Props:
     - isUnlocked: Boolean indicating the current security state.
   - Behavior: Renders a badge with a Shield icon (unlocked) or Lock icon (locked) with corresponding color themes (emerald for unlocked, zinc for locked).

Styling
- Built with Tailwind CSS.
- Dark theme optimized (backgrounds, borders, text colors).
- Responsive interactions (hover, focus, active states) with smooth transitions.