# Haven

A privacy-first, local-first second brain.  
All your notes, links, resources, files and passwords — end-to-end encrypted on the client before they ever leave your device.

The server only ever sees ciphertext.

## Features (MVP)

- End-to-end encryption (AES-256-GCM via Web Crypto API)
- Notes, links, resources, passwords, file attachments
- Bidirectional linking between items
- Soft deletes & audit log
- Pagination, filtering, graph view endpoint
- tRPC for type-safe API
- Client-side only decryption (server is blind)

## Tech Stack

- **Frontend / Backend**: Next.js 14+ (App Router)
- **API Layer**: tRPC
- **Encryption**: Web Crypto API (SubtleCrypto) + PBKDF2 key derivation
- **Database**: (your choice — SQLite / PostgreSQL / Prisma recommended)
- **Auth**: Session-based (cookie / JWT) — master password never sent to server
- **State**: React Context / Zustand (for master key in-memory)
