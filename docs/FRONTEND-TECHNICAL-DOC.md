# Frontend Technical Documentation

## Overview

The frontend of this project is built with Next.js and TypeScript, providing a modern, scalable, and maintainable web application. It follows a modular structure, separating concerns into components, contexts, hooks, services, and types for clarity and reusability.

## Project Structure

- **app/**: Contains route-based pages and layouts (e.g., `about/`, `admin/`, `login/`, `projects/`).
- **components/**: Reusable UI components (forms, navigation, cards, charts, etc.).
- **contexts/**: React Contexts for global state management (e.g., authentication, theme, drive).
- **hooks/**: Custom React hooks (e.g., `use-mobile.ts`).
- **lib/**: Utility functions and API configuration (e.g., `api.ts`, `utils.ts`, `websocket.ts`).
- **services/**: Business logic and API calls (e.g., `ProjectService.ts`, `DriveService.ts`).
- **types/**: TypeScript type definitions for entities (e.g., `project.ts`, `user.ts`).
- **public/**: Static assets (images, icons).

## Key Technologies

- **Next.js**: Framework for server-side rendering and routing.
- **TypeScript**: Type safety and improved developer experience.
- **ESLint**: Linting for code quality (`eslint.config.mjs`).
- **PostCSS**: CSS processing (`postcss.config.mjs`).
- **Docker**: Containerization for development and deployment (`Dockerfile`).

## How to Run

1. **Install dependencies:**
   ```fish
   cd frontend
   npm install
   ```
2. **Start development server:**
   ```fish
   npm run dev
   ```
3. **Lint code:**
   ```fish
   npm run lint
   ```
4. **Build for production:**
   ```fish
   npm run build
   ```

## Adding Features

- Create new components in `components/`.
- Add new pages/routes in `app/`.
- Use contexts for global state.
- Define new types in `types/`.
- Add API logic in `services/` or `lib/api.ts`.

## Best Practices

- Keep components small and focused.
- Use TypeScript for all files.
- Organize code by feature and responsibility.
- Use contexts for shared state.
- Write reusable hooks for logic.

## Useful Scripts

- `autolint_frontend.sh`: Lint frontend code.
- `check_lint_frontend.sh`: Check lint status.
- `run_backend_tests.sh`: Run backend tests (for reference).

## Additional Resources

- See `README.md` in `frontend/` for more details.
- Refer to `eslint.config.mjs` and `tsconfig.json` for configuration.

---

For further questions, see the code comments or reach out to the project maintainers.
