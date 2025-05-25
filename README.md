# SocialExplore3D

A fun, interactive 3D social graph explorer right in your browser. Imagine a globe with your profile at the center and your friends radiating outwards like sparkling nodes. Drag, rotate, search, and connect in a modern, sleek interface.

## Key Features

• **Browser-based 3D Canvas**: Built with Vite, React, React Three Fiber and Drei for smooth, GPU-accelerated visuals.
• **Radial Network Layout**: Your user node stays fixed at the center. Friend nodes sit on an invisible sphere around you, connected by dynamic "spike" edges.
• **Interactive Controls**: Click and drag any node along the sphere surface. Pan, zoom, and rotate the entire network or let it auto-spin.
• **User Profiles**: Click a node to open a profile card. View details like name, phone, address, mutual friends, and your posts.
• **Friend Requests**: Send, approve, or decline requests. Only friends see each other's private info (and neighbors-of-neighbors based on visibility settings).
• **Posts & Visibility**: Upload images with live preview. Choose visibility: _Public_, _Friends_, or _Private_. Posts and friendships persist in localStorage, so they survive page reloads.
• **Search Users**: Live-filter by name, respecting profile visibility rules. Works like a mini Facebook search.
• **Settings Panel**: Toggle whether others see your connections, and switch your profile between public, friends-only, or private.
• **Admin Tools**: If you're an admin, search any user and inspect their graph and posts.

## Getting Started

1. Clone the repo:
   ```bash
   git clone <your-repo-url>
   cd socialexplore3d
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser to http://localhost:5173/ and enjoy!

## Project Structure

- `src/` — Main application code
  - `components/` — Reusable React components (GraphCanvas, NodeCard, Login, etc.)
  - `pages/` — Top-level views (Explorer, Settings, Search, Friends, Admin)
  - `hooks/` — Custom hooks for graph data, posts, and authentication
  - `assets/` — Global styles and images
  - `main.tsx` and `App.tsx` — Application bootstrap and routing

## License & Contributions

This project is MIT-licensed. Feel free to open issues or submit pull requests.

Enjoy exploring your social universe in 3D! 🪐
