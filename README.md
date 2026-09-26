# AuntyID — Smart Digital Student ID Card Platform 🎓

A modern, production-grade React web application and AI assistant for generating, customizing, and downloading professional digital college ID cards with real-time dynamic preview.

**AuntyID**: *"Your friendly AI-powered digital identity assistant."*

---

## 🚀 Core React Concepts Implemented

1. **Controlled Forms**:
   - Every form input (`Full Name`, `Roll Number`, `College Name`, `Branch`, `Year`, `Section`, `Email`, `Phone Number`, `Date of Birth`, `Blood Group`, `Address`) uses explicit `value` and `onChange` attributes bound to React state.
   - Zero uncontrolled inputs.
   - Full input sanitization and field-level validation feedback.

2. **Props & Unidirectional Data Flow**:
   - Centralized student data and design configuration states maintained in the top-level `App` component.
   - Props cleanly propagated downward to specialized child components (`StudentForm`, `IDCard`, `ThemeSelector`, `ActionToolbar`).

3. **State Management**:
   - React `useState` hooks for student data, color themes, card orientation, 3D flip face, download progress, and transient toast notifications.
   - React `useRef` utilized for direct DOM element targeting for high-resolution PNG generation.

4. **Reusable Components**:
   - Modular UI architecture: `Navbar`, `Hero`, `Features`, `HowItWorks`, `StudentForm`, `IDCard`, `ThemeSelector`, `ActionToolbar`, and `Footer`.

5. **Dynamic Rendering**:
   - Live instantaneous DOM updates as the user types (e.g., typing `Harshavardhan` renders uppercase `HARSHAVARDHAN` on the ID card immediately).
   - Dynamic real-time generation of scannable QR codes containing student identity credentials.
   - Dynamic theme switching via CSS custom properties and instant layout orientation toggles.

---

## 🌟 Key Features

- **Professional College ID Design**:
  - Emblems, institution banner, smart microchip, "STUDENT ID" status ribbon.
  - Student photo with border, fallback avatar with initials, and verified holographic badge.
  - Formatted roll number pill, academic majors, blood group tag.
  - Scannable verification QR code with embedded credential payload.
  - Authorized registrar signature and security barcode.
- **Interactive 3D Card Flip**:
  - Toggle between **Front Face** (identity credentials) and **Back Face** (emergency contact, issue dates, institution rules, and barcode).
- **6 University Theme Palettes**:
  - *Oxford Blue* (Primary)
  - *Royal Indigo*
  - *Harvard Crimson*
  - *MIT Emerald*
  - *Midnight Slate*
  - *Imperial Amber*
- **Orientation Modes**:
  - Vertical Lanyard Badge (CR80 portrait)
  - Horizontal Card (CR80 landscape)
- **High-Resolution PNG Export**:
  - Download crisp, print-ready 300 DPI PNG cards powered by `html-to-image`.
  - Direct print & PDF stylesheet support.
- **Hackathon Demo Friendly**:
  - **"Load Sample Data"** button to instantly populate a realistic student profile for judge demonstrations.
  - **"Reset"** button to clear the form.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite 6
- **Icons**: Lucide React
- **QR Code**: `qrcode.react`
- **Image Export**: `html-to-image`
- **Typography**: Plus Jakarta Sans & JetBrains Mono

---

## 🏁 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
