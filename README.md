# Frontend — Vue 3 SPA

The frontend is a Vue 3 Single Page Application deployed to Cloudflare Pages. It serves two audiences: guests who browse the menu, and the event organizer who manages it.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| npm | 10+ | Comes with Node.js |
| Backend Worker | running | See `worker/README.md` for setup |

## Setup (local development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env.local
# Edit .env.local if needed (defaults work for local dev)

# 3. Make sure the backend Worker is running on :8787
# (in another terminal: cd ../worker && wrangler dev --local)

# 4. Start the dev server
npm run dev
# → http://localhost:5173

# 5. Open in browser
#   Guest menu:  http://localhost:5173/
#   Admin panel: http://localhost:5173/admin
```

## Running tests

```bash
# Unit + component tests (Vitest)
npm run test          # watch mode
npm run test:run      # single run
npm run test:coverage # with coverage report

# E2E tests (Playwright) — requires backend running
npm run test:e2e      # headless
npm run test:e2e:ui   # interactive UI mode

# Install Playwright browsers (one time)
npx playwright install chromium
```

> **Note:** The Vite dev server proxies `/api/*` requests to `http://localhost:8787` so the frontend works with the local Worker without CORS issues.

---

## Stack

| Technology | Role |
|-----------|------|
| Vue 3 (Composition API) | UI framework |
| Vue Router 4 | Client-side routing |
| Pinia | State management |
| Tailwind CSS 3 + @tailwindcss/forms | Styling |
| TypeScript 5 | Type safety |
| Vite 5 | Build tool and dev server |
| Vitest 1 + @vue/test-utils | Unit and component testing |
| happy-dom | DOM environment for tests |
| @pinia/testing | Pinia store testing utilities |

---

## Project Structure

```
src/
├── main.ts              # App entry point — registers Pinia, Router, mounts app
├── main.css             # Tailwind base import
├── types.ts             # All TypeScript types (mirrors the Rust models exactly)
│
├── api/
│   └── client.ts        # HTTP client factory
│
├── composables/
│   └── useCocktails.ts  # Data fetching + filtering + polling for the guest menu
│
├── stores/
│   ├── toastStore.ts    # Global notification queue
│   └── adminStore.ts    # Auth, ingredient CRUD, cocktail CRUD, availability stats
│
├── utils/
│   ├── logger.ts        # Structured logger with configurable levels
│   └── cocktailColors.ts # Display constants (Tailwind classes, labels, category order)
│
├── router/
│   └── index.ts         # Route definitions
│
├── views/
│   ├── GuestMenu.vue    # Public cocktail menu (uses useCocktails composable)
│   ├── AdminPanel.vue   # Admin panel (uses adminStore)
│   └── NotFound.vue     # 404 page
│
├── components/
│   ├── CocktailCard.vue         # Single cocktail display for guests
│   ├── CocktailCardSkeleton.vue # Loading placeholder
│   ├── CocktailEditor.vue       # Create/edit cocktail modal
│   ├── CocktailEditorIngredient.vue # Single ingredient row within CocktailEditor
│   ├── FilterBar.vue            # Base + taste filter tabs for the guest menu
│   ├── IngredientForm.vue       # Inline create/edit form for an ingredient
│   ├── IngredientToggle.vue     # Toggle row in the admin ingredients tab
│   ├── ToastNotification.vue    # Toast notification display
│   └── ConfirmDialog.vue        # Reusable confirmation modal
│
└── tests/
    ├── setup.ts         # Global Vitest setup (env stubs, console suppression)
    ├── fixtures.ts      # Shared test data factories
    ├── unit/            # Pure function tests (apiClient, logger, cocktailColors)
    ├── components/      # Component tests with @vue/test-utils
    ├── stores/          # Pinia store tests
    ├── composables/     # Composable tests
    └── views/           # View-level integration tests
```

---

## Routing

There are three routes:

| Path | View | Notes |
|------|------|-------|
| `/` | `GuestMenu` | Public, eagerly loaded |
| `/admin` | `AdminPanel` | Lazy loaded; auth is handled inside the component, not in a route guard |
| `/:pathMatch(.*)*` | `NotFound` | Catch-all, lazy loaded |

**Why no route guard for `/admin`?**

The admin panel is a small form-over-data interface, not a security-sensitive page. The actual protection is on the API — the Worker rejects any request without valid credentials. A route guard would only hide the login form, not protect anything. Keeping auth inside the component keeps the router simple and avoids the complexity of async guards and redirect loops.

---

## State Management

The app uses two Pinia stores and one composable for data. They have distinct responsibilities.

### `toastStore` — Global Notification Queue

The simplest store. It holds a list of active toast notifications and exposes `show(message, type, duration?)` and `dismiss(id)`.

The critical design decision here is using a Pinia store instead of `provide/inject`. Since the admin store needs to show toasts after API calls (which are not triggered by user interaction inside a component), it needs access to the toast system outside of the component tree. A Pinia store is accessible anywhere, including inside other stores and composables.

**Behavior:**
- Up to 3 toasts visible at once (oldest is dropped when the limit is hit)
- Errors stay for 5 seconds; info/success for 3 seconds
- Auto-dismissed via `setTimeout`

### `adminStore` — Admin State and Actions

The central store for everything the admin does. It owns:

- **Auth state:** `authToken` persisted in `sessionStorage` so the session survives page refreshes. On mount, `init()` re-fetches data if a token is already present.
- **Data:** `ingredients` and `cocktails` lists, fetched from the API.
- **Computed stats:** `availabilityStats` and `ingredientsByCategory` are derived from the raw data — they update automatically when data changes, with no extra fetches.
- **CRUD actions:** All write operations follow the same pattern: set `syncStatus = 'saving'`, call the API, re-fetch the affected list, set `syncStatus = 'saved'`.

**Optimistic updates for ingredient toggles:**

The availability toggle is the most frequent admin action (flipping ingredients on/off). To make it feel instant, `toggleIngredient` flips the local value immediately before the API call. If the call fails, it reverts. After a successful toggle, it re-fetches the cocktail list because cocktail availability may have changed — this is intentional and necessary.

**Auto-logout on 401:**

The `handleError` helper checks if an API error has status 401 and calls `logout()` automatically. This handles the case where credentials are changed elsewhere while the admin is logged in.

### `useCocktails` — Guest Menu Data

This is a composable rather than a store because its state is local to a single view (`GuestMenu`). There is no need to share it globally.

It handles:
- **Filters:** `selectedBase` and `selectedTaste` are refs initialized from the URL query string. When they change, the URL is updated via `router.replace` (no navigation, no history entry) and a debounced fetch is triggered.
- **Polling:** The list refreshes every 60 seconds so guests see availability updates without manual refreshes. Polling pauses when the browser tab is hidden (via `visibilitychange`) to avoid unnecessary network traffic, and resumes with an immediate fetch when the tab becomes visible again.
- **Cleanup:** `onUnmounted` clears the interval, removes the event listener, and cancels any pending debounce timer.

---

## How the API Client Works

`createApiClient(options?)` is a factory function that returns a thin HTTP client with four methods: `get`, `post`, `put`, `patch`, `delete`.

It is a factory (not a singleton) so that different callers can use different options. In practice:
- The admin store creates a client with `{ authToken: ... }` to send credentials
- `useCocktails` uses the default `createApiClient()` with no token

Every request automatically:
1. Prepends `VITE_API_URL` to the path (empty string in production means same-origin)
2. Sets `Content-Type: application/json`
3. Adds `Authorization: Basic <token>` if a token was provided
4. Logs the method, path, status code, and duration in milliseconds
5. Throws `ApiError(status, body, url)` for non-2xx responses
6. Returns `undefined` for `204 No Content` responses
7. Returns parsed JSON for all other success responses

The `ApiError` class (defined in `types.ts`) extends `Error` with `status`, `body`, and `url` properties. This allows callers to distinguish between network errors (status 0) and HTTP errors, and to handle specific status codes like 401.

---

## How Logging Works

`createLogger(module)` returns a namespaced logger with four levels: `debug`, `info`, `warn`, `error`.

```typescript
const log = createLogger('useCocktails')
log.debug('Fetching cocktails', { base: 'gin' })
log.error('API call failed', err)
```

**Log format:** `[HH:MM:SS] [LEVEL] [ModuleName] message {data}`

**Level control:** Reads `VITE_LOG_LEVEL` at initialization. If not set, defaults to `debug` in dev mode and `info` in production (determined by `import.meta.env.DEV`). Set `VITE_LOG_LEVEL=error` to suppress everything below errors.

In the Vitest setup, `VITE_LOG_LEVEL` is stubbed to `error` so tests do not produce noisy console output.

---

## How to Run Tests

```bash
cd frontend
npm install

# Watch mode (for development)
npm test

# Single run (for CI)
npm run test:run

# With coverage report
npm run test:coverage
```

Tests are configured via `vite.config.ts` (or `vitest.config.ts`) to use `happy-dom` as the DOM environment and `src/tests/setup.ts` as the global setup file.

**Test setup (`src/tests/setup.ts`):**
- Stubs `VITE_API_URL`, `VITE_EVENT_NAME`, and `VITE_LOG_LEVEL` before each test
- Suppresses console output by default (tests can call `vi.restoreAllMocks()` to re-enable it)
- Clears `sessionStorage` after each test to prevent auth state leaking between tests

**Shared fixtures (`src/tests/fixtures.ts`):**
Contains factory functions for creating test data (cocktails, ingredients, etc.) in a consistent shape. Prefer using these over writing inline test objects to avoid test data drift.

---

## How to Add New Components

1. **Create the component file** in `src/components/`. Use `<script setup lang="ts">` (Composition API with the setup sugar syntax).

2. **Define props with TypeScript.** Use `defineProps<{ ... }>()` and `defineEmits<{ ... }>()` for full type safety:
   ```vue
   <script setup lang="ts">
   const props = defineProps<{
     title: string
     isOpen: boolean
   }>()
   const emit = defineEmits<{
     close: []
     confirm: [value: string]
   }>()
   </script>
   ```

3. **Use Tailwind for styling.** There is no CSS module setup — Tailwind utility classes are the convention throughout the project.

4. **Write a test.** Create a corresponding test file in `src/tests/components/`. A minimal component test:
   ```typescript
   import { mount } from '@vue/test-utils'
   import { describe, it, expect } from 'vitest'
   import MyComponent from '@/components/MyComponent.vue'

   describe('MyComponent', () => {
     it('renders the title', () => {
       const wrapper = mount(MyComponent, {
         props: { title: 'Hello' }
       })
       expect(wrapper.text()).toContain('Hello')
     })
   })
   ```

5. **If the component needs a store,** wrap the mount in a Pinia test instance:
   ```typescript
   import { createTestingPinia } from '@pinia/testing'

   const wrapper = mount(MyComponent, {
     global: {
       plugins: [createTestingPinia({ createSpy: vi.fn })]
     }
   })
   ```

6. **If the component needs the router** (e.g. uses `useRoute` or `<RouterLink>`), pass `createRouter` in the plugins array:
   ```typescript
   import { createRouter, createMemoryHistory } from 'vue-router'

   const router = createRouter({ history: createMemoryHistory(), routes: [] })
   // add to global.plugins
   ```
