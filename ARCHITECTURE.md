# Architecture Documentation

## High-Level Architecture

Smart Session Planner follows a **client-server architecture** with clear separation between the mobile client (Expo/React Native) and the backend API (Next.js).

```
┌─────────────────┐         HTTP/REST         ┌─────────────────┐
│                 │ ◄────────────────────────► │                 │
│  Mobile App     │                            │  Backend API    │
│  (Expo/RN)      │                            │  (Next.js)      │
│                 │                            │                 │
│  - View Layer   │                            │  - API Routes   │
│  - Controller   │                            │  - Business      │
│  - Model        │                            │    Logic        │
└─────────────────┘                            └────────┬────────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │   SQLite DB   │
                                                  │   (Prisma)    │
                                                  └──────────────┘
```

## Mobile App Architecture

### Pattern: Model-Controller-View (MCV)

The mobile app follows a functional programming approach with clear separation:

#### Model Layer (`src/model/`)
- **Purpose**: Domain models, data transformations, and business logic
- **Files**:
  - `types.ts`: TypeScript type definitions
  - `session.ts`: Session-related transformations and utilities
- **Principles**:
  - Pure functions (no side effects)
  - Immutable data transformations
  - Uses Ramda for functional composition

#### Controller Layer (`src/controller/`)
- **Purpose**: React hooks for data fetching and state management
- **Files**:
  - `api.ts`: API client with fetch wrappers
  - `sessionsStore.ts`: Centralized state store with AsyncStorage caching and observer pattern
  - `useSessionTypes.ts`: Hook for session types management
  - `useSessions.ts`: Hook for sessions management (subscribes to sessionsStore)
  - `useSuggestions.ts`: Hook for fetching suggestions (supports fetching for all session types)
  - `useProgress.ts`: Hook for progress statistics (auto-refetches when sessions change)
  - `useAvailability.ts`: Hook for availability windows
- **State Management**:
  - **Centralized Store**: `sessionsStore` uses singleton pattern with observer/subscriber model
  - **AsyncStorage Caching**: Sessions cached locally for instant display and offline support
  - **Automatic Sync**: Store syncs with server in background, updates listeners on changes
  - **Cross-Screen Updates**: All screens using `useSessions` automatically update when store changes
- **Principles**:
  - Custom hooks encapsulate data fetching logic
  - Error handling at hook level
  - Loading states managed internally
  - Reactive updates via store subscriptions

#### View Layer (`src/view/`)
- **Purpose**: UI components and screens
- **Structure**:
  - `components/`: Reusable UI components
  - `screens/`: Full-screen components
- **Styling**: styled-components with theme system
- **Accessibility**: All interactive elements include proper ARIA labels

### Key Design Decisions

1. **No Barrel Files**: Direct imports used instead of `index.ts` exports (per feedback)
2. **Type Inference**: Types inferred from API responses, avoiding redundant interfaces
3. **Functional Components**: All components are functional with hooks
4. **Theme System**: Centralized theme with styled-components for consistency
5. **Centralized State**: Sessions managed via singleton store pattern for cross-screen consistency
6. **Client-Side Caching**: AsyncStorage used for offline support and instant UI updates
7. **Reactive Updates**: Store uses observer pattern to notify all subscribers of changes
8. **Screen Focus Refetching**: `useFocusEffect` ensures data refreshes when screens come into focus

## Backend API Architecture

### Pattern: RESTful API with Business Logic Separation

#### API Routes (`app/api/`)
- **Structure**: Next.js App Router API routes
- **Endpoints**: RESTful design following resource-based URLs
- **Error Handling**: Consistent error responses with appropriate HTTP status codes
- **Validation**: Request validation at route level

#### Business Logic (`app/model/`)
- **Purpose**: Core algorithms and domain logic
- **Files**:
  - `suggestion.ts`: Smart suggestion algorithm with multiple heuristics
  - `progress.ts`: Progress statistics calculation
  - `types.ts`: Type definitions (inferred from Prisma where possible)
- **Principles**:
  - Pure functions
  - Functional programming with Ramda
  - Comprehensive test coverage

#### Database Layer (`prisma/`)
- **ORM**: Prisma for type-safe database access
- **Database**: SQLite (development) / PostgreSQL (production-ready)
- **Migrations**: Version-controlled schema changes
- **Client**: Singleton pattern in `lib/prisma.ts`

### Smart Suggestion Algorithm

The suggestion algorithm (`app/model/suggestion.ts`) implements a **multi-factor scoring system**:

1. **Spacing Score** (30% weight)
   - Ensures minimum spacing between sessions
   - Rewards ideal spacing (24 hours)

2. **Priority Score** (15% weight)
   - Higher priority sessions get better scores

3. **Day Load Score** (20% weight)
   - Penalizes days with too many sessions
   - Prevents overload

4. **Availability Score** (25% weight)
   - Matches user's availability windows
   - Critical for usability

5. **Fatigue Score** (10% weight)
   - Prevents clustering of high-priority sessions
   - Distributes workload evenly

**Trade-offs**:
- **Performance**: Generates slots for 7 days ahead (configurable) - could be optimized with caching
- **Accuracy**: Heuristic-based rather than ML - simpler but less adaptive
- **Flexibility**: Fixed weights - could be made configurable per user
- **Availability Windows**: Falls back to default hours (6 AM - 10 PM) if none configured - ensures suggestions always available
- **Multi-Type Suggestions**: Fetches suggestions for all session types in parallel, combines and sorts - provides diverse suggestions

## Data Flow

### Creating a Session

```
User Action (Mobile)
    ↓
HomeScreen Component
    ↓
useSessions Hook
    ↓
sessionsStore.createSession()
    ├─ sessionsAPI.create() → POST /api/sessions
    ├─ Update local state immediately
    ├─ Save to AsyncStorage cache
    └─ Notify all subscribers (useSessions hooks)
        ↓
    All screens update automatically
    ↓
useProgress Hook (subscribed to store)
    ↓
Auto-refetches progress stats
```

### Generating Suggestions

```
User Request (Mobile)
    ↓
useSuggestions Hook
    ↓
fetchAllSuggestions() (for all session types)
    ├─ Parallel API calls for each session type
    ├─ suggestionsAPI.getSuggestions() → GET /api/suggestions
    ├─ Combine and sort by score
    └─ Return top 5 suggestions
    ↓
API Route Handler
    ↓
generateSuggestions() Algorithm
    ├─ Fetch existing sessions
    ├─ Fetch availability windows
    ├─ Generate time slots (defaults to 6 AM - 10 PM if no availability)
    ├─ Score each slot using multi-factor heuristics
    └─ Return top suggestions sorted by score
```

## Database Schema

### SessionType
- Stores session type definitions (name, category, priority)
- One-to-many relationship with Session

### AvailabilityWindow
- Stores user's weekly availability
- Indexed by dayOfWeek for efficient queries

### Session
- Stores scheduled sessions
- Includes completion status
- Indexed by startTime, sessionTypeId, completed

## State Management Details

### SessionsStore Architecture

The `sessionsStore` implements a **centralized state management pattern**:

- **Singleton Pattern**: Single instance shared across the app
- **Observer Pattern**: Components subscribe to changes via `subscribe()` method
- **AsyncStorage Caching**: Sessions persisted locally for offline support
- **Optimistic Updates**: Local state updated immediately, then synced with server
- **Cache Invalidation**: 5-minute TTL, auto-syncs when stale

**Benefits**:
- Cross-screen consistency (all screens see same data)
- Instant UI updates (from cache)
- Automatic synchronization
- Offline support

**Flow**:
1. Store initialized on app start
2. Loads from AsyncStorage cache (instant display)
3. Syncs with server in background
4. On mutations (create/update/delete), updates local state immediately
5. Notifies all subscribers (hooks) to update UI
6. Syncs with server to ensure consistency

### Progress Stats Auto-Update

The `useProgress` hook automatically refetches statistics when sessions change:
- Subscribes to `sessionsStore` changes
- Automatically calls `fetchStats()` when store notifies listeners
- Ensures stats stay in sync across all screens without manual refetching

## Security Considerations

1. **Input Validation**: All API endpoints validate input
2. **SQL Injection**: Prisma ORM prevents SQL injection
3. **CORS**: Should be configured for production
4. **Rate Limiting**: Not implemented (should be added for production)
5. **Authentication**: Not implemented (single-user assumption)

## Performance Considerations

1. **Database Indexes**: Key fields indexed for query performance
2. **API Caching**: Not implemented (could add Redis for production)
3. **Mobile Caching**: 
   - AsyncStorage cache for sessions (5-minute TTL)
   - Instant UI updates from cache, background sync with server
   - Store pattern prevents redundant API calls
4. **Suggestion Algorithm**: Generates suggestions on-demand (could be precomputed)
5. **Reactive Updates**: Store subscriptions ensure efficient UI updates without manual refetches
6. **Memoization**: Computed values (todaySessions, weekSessions) memoized to prevent recalculation

## Scalability

### Current Limitations
- SQLite file-based database (single server)
- No horizontal scaling support
- No caching layer

### Production Recommendations
1. **Database**: Migrate to PostgreSQL for multi-server support
2. **Caching**: Add Redis for suggestion caching
3. **CDN**: Serve static assets via CDN
4. **Load Balancing**: Multiple API instances behind load balancer
5. **Database Replication**: Read replicas for read-heavy workloads

## Testing Strategy

### Unit Tests
- Model layer: Pure function testing
- Business logic: Algorithm correctness (suggestion algorithm has comprehensive tests)
- Components: Rendering and interactions

### Integration Tests
- API endpoints: Request/response validation
- Database operations: CRUD operations

### E2E Tests
- Not implemented (would use Detox or similar)

## Future Enhancements

1. **Authentication**: Multi-user support
2. **Offline Mode**: Local storage with sync
3. **Push Notifications**: Session reminders
4. **Calendar Integration**: Sync with external calendars
5. **ML-Based Suggestions**: Learn from user behavior
6. **Analytics**: Usage tracking and insights

