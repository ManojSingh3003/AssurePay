# Design System

## Core Aesthetics
Modern, clean light mode with high-contrast elements and glassmorphic components. It avoids generic blocky forms in favor of animated Modals and Chat Bubbles to handle financial transactions.

## Typography
- Primary: Inter (sans-serif)
- Hierarchy: Large bold headings, muted small body text for timestamps.

## Color Palette
- Brand Accent: Deep Cyan/Blue (`#00B4D8`)
- Success: Vibrant Green (`#10B981`)
- Error: Soft Red (`#EF4444`)
- Backgrounds: Very light gray (`bg-gray-50`)
- Surfaces: Pure white (`bg-white`)

## Components & Geometry
- Cards & Bubbles: `rounded-2xl` with soft `shadow-sm` or `shadow-md`.
- Modals: Darkened backdrop (`bg-black/50 backdrop-blur-sm`) with scale/fade animations.
- Interactive: Active states use physical push simulation (e.g. `scale-95`).

## Motion
- Modal Entry: `animate-in fade-in zoom-in-95 duration-200`
- Chat Bubbles: Optimistic immediate render.
