# **App Name**: Invoice Platform

## Core Features:

- Instant Invoice Generation: Create invoices instantly without login, including dynamic item entry, client details, tax/discount, notes, due date, auto-calculation, and optional logo upload via Supabase Storage.
- Live Invoice Preview: Real-time, responsive rendering of the invoice that updates instantly with form input changes, supporting proper scaling and clean print layouts.
- Invoice Export (PDF/Image): Functionality to export generated invoices as PDF and PNG images, ensuring content integrity and correct scaling across devices.
- Optional User Authentication: Enable users to log in and out via Supabase Auth to access personalized features like saving and managing invoices.
- Personal Invoice Dashboard: For logged-in users, a dedicated dashboard to view, search, filter, edit, and delete their saved invoices.
- Customizable Invoice Templates: Users can select from a database of predefined templates to customize the invoice's layout, typography, and colors, with instant preview updates.
- AI-Powered Contact Response Assistant: An admin tool that utilizes generative AI to draft quick, context-aware email replies to user contact messages, facilitating efficient communication.

## Style Guidelines:

- Primary color: Deep indigo (#4D4D99) chosen for its professional and trustworthy appeal, anchoring the application's clean aesthetic. Its depth provides excellent contrast for text in a light-themed interface.
- Background color: A very light lavender-grey (#EFF0F6). This heavily desaturated variant of the primary hue provides a spacious, minimal backdrop that enhances readability and complements the main color without distraction.
- Accent color: Vibrant sky blue (#4488DD). This color is analogous to the primary but is significantly brighter and more saturated, making it ideal for drawing attention to critical interactive elements, calls to action, and highlights.
- Headline font: 'Space Grotesk' (sans-serif) to convey a modern, tech-forward, and bold brand identity for headings and impactful text.
- Body font: 'Inter' (sans-serif) for superior readability in forms, invoice details, and general body text, maintaining a clean and objective look.
- Clean, minimalistic outline-style icons are recommended to ensure clarity and avoid visual clutter, aligning with the app's functional and streamlined interface.
- A responsive, grid-based layout prioritizes mobile-first design, ensuring optimal content display and user interaction across all device sizes. The invoice generator will feature a two-column structure on desktops (form on left, preview on right), seamlessly collapsing to a single-column stacked layout on mobile.
- Subtle and purposeful micro-interactions and transitions will be implemented to provide intuitive user feedback for actions like form submissions, item additions, and state changes, ensuring a smooth and highly responsive user experience without unnecessary flamboyance.