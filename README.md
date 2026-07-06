# Mini ERP - Frontend

A sleek, premium frontend for the Mini ERP application, built with modern web technologies. This application provides a comprehensive dashboard for inventory management, sales tracking, and role-based access control, wrapped in a beautiful, glassmorphism-inspired UI with smooth GSAP animations.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [GSAP](https://gsap.com/) (GreenSock Animation Platform)
- **State Management & Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Linting**: [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)

## ✨ Key Features

- **Premium UI/UX**: Custom glassmorphism design, deep dark/light modes with gradient meshes, and subtle hover interactions.
- **Fluid Animations**: Staggered entry animations, timeline panel transitions, and scalable interactive elements powered by GSAP.
- **Role-Based Access Control (RBAC)**: Secure routes tailored for Admins, Managers, and Employees. Users only see and interact with what they are authorized for.
- **Comprehensive Dashboard**: Real-time widgets tracking Total Products, Sales, and Low Stock Alerts.
- **Inventory Management**: 
  - Dynamic products table with inline image thumbnails.
  - Granular details displaying both Purchase Price & Selling Price margins.
  - Automated stock status badging (Healthy, Low Stock, Out of Stock).
- **Sales Tracking**: Intuitively create and track new sales records.
- **Secure Authentication**: JWT-based authentication system with persistent local storage securely handling user sessions.

## 📁 Project Structure

```text
src/
├── assets/         # Static images and global assets
├── components/     # Reusable UI components (Layout, Auth guards, UI primitives)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions, permissions logic, and Axios API configurations
├── pages/          # Full page components (Dashboard, Products, Sales, Login, Register)
├── types/          # TypeScript interfaces and global type definitions
├── App.tsx         # Main application routing and wrapper
├── index.css       # Global styles, Tailwind directives, and CSS variables
└── main.tsx        # Application entry point
```

## 🛠️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/alamin-87/mini-erp-frontend.git
   cd mini-erp-frontend
   ```

2. **Install dependencies**:
   This project uses `npm` as the package manager.
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and configure your backend API URL.
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 🎨 Design System

The application relies on a strictly defined set of Tailwind CSS variables to maintain visual consistency.
- **Colors**: Configured via OKLCH in `index.css` to allow vibrant, uniform color interpolation across the app.
- **Components**: `components.json` is used to track and manage Shadcn UI primitive components.
- **Fonts**: `@fontsource-variable/geist` provides a clean, modern sans-serif typography.

## 📦 Building for Production

To create a production-ready optimized build:

```bash
npm run build
```

This command runs the TypeScript compiler and Vite's build process, outputting static files into the `dist` directory. You can preview the production build using:

```bash
npm run preview
```

## 📜 Linting & Formatting

This project utilizes `oxlint` for blazingly fast code linting.
```bash
npm run lint
```
