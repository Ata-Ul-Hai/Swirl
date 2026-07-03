# Swirl

Swirl is a React food ordering app built with Vite, React Router, Redux Toolkit, and Tailwind CSS. It lets users browse restaurants, inspect restaurant menus, add items to a cart, and explore a lazily loaded grocery section.

## Features

- Restaurant listing with search and top-rated filtering.
- Restaurant detail pages with category-based menus.
- Cart management powered by Redux Toolkit.
- Responsive header with mobile navigation and live cart count.
- User name context shared across the app.
- Offline/online status indicator.
- Lazy-loaded grocery route with a shimmer fallback.
- Testing setup with Vitest and React Testing Library.

## Tech Stack

- React 19
- Vite
- React Router
- Redux Toolkit
- Tailwind CSS
- Axios
- Vitest

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Run tests

```bash
npm test
```

## Available Scripts

- `npm run dev` - start the local Vite dev server.
- `npm run build` - create an optimized production build.
- `npm run preview` - preview the production build locally.
- `npm run lint` - run ESLint across the project.
- `npm test` - run the Vitest test suite.

## Project Structure

```text
api/                API helpers and backend-facing routes
public/             Static public assets
src/
	components/       UI components and route screens
	utils/            Context, Redux slice, hooks, and constants
	App.jsx           Application router
	main.jsx          App entry point
__tests__/          Test setup
```

## Main Routes

- `/` - restaurant listing and search
- `/restaurants/:resId` - restaurant menu page
- `/about` - about page
- `/contact` - contact page
- `/cart` - cart page
- `/grocery` - lazy-loaded grocery page

## Notes

- Restaurant data is loaded from an external API proxy.
- The grocery route is lazy loaded to demonstrate code splitting.
- The cart state is stored in Redux Toolkit, while the logged-in user name is shared through context.
