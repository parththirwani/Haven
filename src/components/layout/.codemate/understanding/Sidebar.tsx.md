

Component Overview
This file defines the Sidebar component for a Next.js application named "Haven". It serves as the primary navigation interface for a secure vault system, allowing users to access different sections such as Notes, Links, Passwords, and Files. The component is built as a client-side React component using the App Router.

Key Features
Navigation Management: Provides links to core vault sections (Notes, Links, Resources, Passwords, Files) and exploration tools (Graph, Audit log, Trash).
Active State Detection: Automatically highlights the current route using the usePathname hook and a custom isActive helper function.
Authentication Handling: Includes a sign-out button that triggers a TRPC mutation. Upon success, it locks the vault via a custom store and redirects the user to the login page.
Animations: Utilizes Framer Motion for smooth entry animations when the sidebar mounts.
Responsive Styling: Uses Tailwind CSS for a dark-themed UI with indigo accents and hover effects.

Props
collapsed (boolean, optional): Defaults to false. Intended to control the width or visibility of the sidebar, though the current implementation uses a fixed width.

Internal Components
NavLink: A memoized sub-component responsible for rendering individual navigation links. It handles styling based on whether the link is active and includes icons and labels.

Dependencies
Framework: Next.js (Link, usePathname, useRouter)
Animation: Framer Motion (motion)
Icons: Lucide React (FileText, Lock, LogOut, etc.)
API: tRPC (api.auth.signout)
State Management: Custom Vault Store (useVault)

UI Structure
Header: Displays the application logo ("Haven") with a lock icon.
Navigation Sections: Divided into "Vault" (primary content) and "Explore" (secondary tools).
Footer: Contains the Sign Out button, positioned at the bottom of the sidebar.

Technical Notes
The component uses React.memo on the NavLink sub-component to optimize rendering performance.
The sign-out process ensures the vault is locked before redirecting to maintain security.
The sidebar is fixed in width (w-56) and height (h-full) with a border separator.