

VaultGuard Component Documentation

Overview
This file implements a client-side authentication gate for a secure vault application built with Next.js and React. It manages the lifecycle of the user's encryption key, handling session restoration, vault unlocking, and routing logic based on authentication state.

Core Functionality
- Session Restoration: On mount, it attempts to load a persisted encryption key from session storage.
- State Management: Tracks the vault status through four states: restoring, unlocked, locked, and redirecting.
- Routing Logic: Automatically redirects users to onboarding or login pages if necessary, or unlocks the UI if credentials are valid.
- Security: Handles client-side key derivation using a master password and salt.

Component Breakdown

1. VaultGuard (Main Component)
   - Acts as a wrapper for protected content.
   - Uses the useVault store to check unlock status and onboarding requirements.
   - Renders a loading screen while determining state.
   - Renders the unlock screen if the vault is locked but the user exists.
   - Renders children only when the vault is successfully unlocked.

2. VaultUnlockScreen
   - Provides the UI for entering the master password.
   - Includes password visibility toggling and error handling for incorrect passwords.
   - Uses Framer Motion for smooth entry animations.
   - Displays security assurances regarding end-to-end encryption.
   - Offers a link to switch accounts.

3. VaultLoadingScreen
   - Displays a minimal loading animation with a lock icon.
   - Shown during the initial restoration phase or when redirecting.

Dependencies and Utilities
- React Hooks: useEffect, useState, useCallback for state and side effects.
- Next.js: useRouter for navigation.
- Framer Motion: For UI animations.
- Lucide React: For icons (Lock, Eye, Shield, etc.).
- Custom Stores/Utils: useVault (state management), deriveKey (crypto), loadKeyFromSession (persistence).

Security Considerations
- Keys are derived in the browser using a master password and salt.
- Session keys are stored temporarily in sessionStorage.
- The component ensures content is never rendered until the vault is explicitly unlocked.