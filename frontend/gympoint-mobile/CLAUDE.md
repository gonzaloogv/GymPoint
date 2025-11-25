# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GymPoint Mobile is a React Native fitness app built with Expo, TypeScript, and NativeWind. It follows a Clean Architecture pattern with feature-based organization. The app is currently migrating from a previous design system to NativeWind with Tailwind CSS styling.

## Development Commands

### Setup & Installation
```bash
npm install          # Install dependencies
npm run type-check   # Run TypeScript compiler
```

### Running the App
```bash
npm start            # Start Expo development server
npm run android      # Run on Android emulator/device
npm run ios          # Run on iOS simulator/device
npm run web          # Run web version
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Architecture Overview

### Clean Architecture Pattern with Feature-Based Organization

The codebase is organized around features, with each feature split into clear layers following Clean Architecture principles:

```
src/
├── features/          # Feature modules (auth, gyms, routines, rewards, home, user)
│   └── [feature]/
│       ├── data/      # Data layer - DTOs, mappers, repositories, remote/local data sources
│       ├── domain/    # Domain layer - Entities, use cases, abstract repositories, constants
│       └── presentation/
│           ├── state/    # Zustand stores (state management)
│           ├── hooks/    # Feature-specific hooks
│           └── ui/       # Components and screens
├── shared/            # Shared infrastructure across features
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Shared React hooks
│   ├── http/          # HTTP client setup
│   ├── providers/     # Context providers & theme providers
│   ├── services/      # Shared business logic services
│   ├── styles/        # Global styles and theme definitions
│   ├── config/        # Configuration files
│   ├── constants/     # Shared constants
│   └── utils/         # Utility functions
├── di/                # Dependency injection container (manual DI pattern)
├── presentation/      # Global presentation layer
│   ├── navigation/    # Route navigation setup (React Navigation)
│   └── theme/         # Theme configuration
└── types/             # Global TypeScript type definitions
```

### Data Flow Pattern

1. **UI Layer** (screens & components) → calls hooks/stores
2. **State Layer** (Zustand stores) → use cases via dependency injection
3. **Domain Layer** (use cases) → abstract repositories
4. **Data Layer** (repositories) → remote APIs or local storage
5. **Back to UI** (via store subscriptions)

### Key Architectural Decisions

- **State Management**: Zustand with Immer middleware for immutable updates
- **Dependency Injection**: Manual DI container in `src/di/container.ts` (not using libraries)
- **Data Persistence**: AsyncStorage for local data (used in routines and rewards features)
- **API Communication**: Axios with centralized HTTP client
- **Form Validation**: Zod for schema validation
- **Navigation**: React Navigation with native stack and bottom tabs

## Styling & Theme System

### NativeWind + Tailwind CSS
- The project is migrating to NativeWind (Tailwind CSS for React Native)
- Tailwind config is in `tailwind.config.js`
- Global styles in `global.css`
- Theme colors defined in Tailwind config: primary, secondary, success, error, warning, info
- Light and dark mode support via `darkMode: 'class'`

### Theme Structure
Theme system is centralized in `src/presentation/theme/` with color definitions and spacing utilities. Components should use theme values for consistent styling.

## State Management with Zustand

All features have a state store in `presentation/state/[feature].store.ts`:

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type FeatureState = {
  // State properties
  data: DataType[];
  setData: (data: DataType[]) => void;
};

export const useFeatureStore = create<FeatureState>()(
  immer((set) => ({
    data: [],
    setData: (data) => set((state) => { state.data = data; }),
  })),
);
```

Use Immer middleware for immutable state updates - mutations inside the callback are safe.

## Dependency Injection Pattern

Services are instantiated in `src/di/container.ts` and exported as a singleton:

```typescript
export const DI = new Container();
```

To use in a component:
```typescript
const useFeatureData = async () => {
  const data = await DI.getFeatureData.execute();
};
```

## Feature Implementation Guidelines

### Adding a New Use Case
1. Create file in `domain/usecases/[UseCase].ts`
2. Use case receives repository in constructor
3. Has single `execute()` method returning Promise
4. Register in DI container `src/di/container.ts`

### Adding a New Repository
1. Create abstract interface in `domain/repositories/[Repository].ts`
2. Create implementation in `data/[RepositoryName]Impl.ts`
3. Data source implementations in `data/datasources/`
4. Use DTOs and mappers to convert between API responses and domain entities

### Creating UI Components
- Place in `presentation/ui/components/` for reusable, or `presentation/ui/screens/` for full screens
- Use NativeWind classes for styling
- Store logic in Zustand stores, not component state
- Use feature-specific hooks for complex logic

## Git Workflow

Current branch: `migration` - ongoing migration to NativeWind design system
Main branch: `main` - production-ready code

Recent focus: Refactoring Gyms feature and LoginScreen/basic UI components to NativeWind with full theme support.

## TypeScript Path Aliases

Well-organized import paths are configured in `tsconfig.json`:

- `@features/*` → `src/features/*` (feature modules with specific layer access)
- `@features/[feature]/data|domain|state|ui/*` → Direct layer access
- `@presentation/*` → `src/presentation/*` (navigation, theme)
- `@shared/*` → `src/shared/*` (reusable components, hooks, utilities)
- `@di/*` → `src/di/*` (dependency injection container)
- `@assets/*` → `assets/*` (images, icons)
- `@app/*` → `app/*` (Expo Router app directory)

Use these aliases in imports for consistency and to make refactoring easier.

## Testing Considerations

- Tests should be placed alongside source files with `.test.ts` or `.test.tsx` suffix
- Test use cases and data layer extensively (business logic)
- Mock repositories and HTTP client for unit tests
- Use Zustand store testing patterns (create isolated stores for tests)

## Common Issues & Solutions

### NativeWind Styling Not Applied
- Clear Metro bundler cache: `npm start -- --clear`
- Ensure `global.css` is imported in `App.tsx`
- Verify Tailwind classes are in the content paths in `tailwind.config.js`

### Type Errors in Presentation Layer
- Check that domain entities are imported from domain layer
- Use DTOs in data layer, map to entities in repository
- Ensure proper typing in Zustand stores

### AsyncStorage Issues
- Always check `AsyncStorage` is initialized before use
- Used in Routines and Rewards features for offline persistence
- Consider network state when deciding between local and remote data
