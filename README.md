# Smart Session Planner

A full-stack mobile application for intelligent session planning and tracking, built with Expo (React Native) and Next.js.

## Overview

Smart Session Planner helps users manage their sessions (workouts, meditation, deep work, etc.) with intelligent scheduling suggestions based on availability, priority, spacing, and fatigue heuristics.

## Tech Stack

### Mobile App
- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Styling**: styled-components
- **State Management**: React Hooks
- **Functional Programming**: Ramda
- **Date Utilities**: date-fns

### Backend API
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Functional Programming**: Ramda
- **Date Utilities**: date-fns

## Project Structure

```
smart-session-planner/
├── mobile/                 # Expo React Native app
│   ├── src/
│   │   ├── model/          # Domain models and transformations
│   │   ├── controller/     # React hooks and API client
│   │   ├── view/           # UI components and screens
│   │   └── styles/         # Theme and styled-components
│   └── App.tsx             # Root component
│
├── api/                    # Next.js backend API
│   ├── app/
│   │   ├── api/            # API routes
│   │   └── model/          # Business logic and algorithms
│   ├── lib/                # Utilities (Prisma client)
│   └── prisma/             # Database schema and migrations
│
├── README.md
└── ARCHITECTURE.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (for mobile development)
- iOS Simulator (Mac) or Android Emulator (for mobile testing)

### Backend Setup

1. Navigate to the API directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Mobile App Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL (create `.env` file):
```bash
echo "EXPO_PUBLIC_API_URL=http://localhost:3000" > .env
```

4. Start the Expo development server:
```bash
npm start
```

5. Run on iOS simulator:
```bash
npm run ios
```

Or scan the QR code with Expo Go app on your device.

## Environment Variables

### Backend (`api/.env`)
```
DATABASE_URL="file:./dev.db"
```

### Mobile (`mobile/.env`)
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For production, update `EXPO_PUBLIC_API_URL` to your deployed API URL.

## Features

### Core Features

1. **Session Types Management**
   - Create, edit, and delete session types
   - Configure priority (1-5), category, and name
   - Track completion counts per type

2. **Availability Windows**
   - Define weekly availability (e.g., Monday 9am-5pm)
   - Multiple windows per day supported
   - Used for smart suggestions

3. **Session Scheduling**
   - Create sessions with type, date/time, and duration
   - View upcoming and today's sessions
   - Mark sessions as completed
   - Conflict detection for overlapping sessions

4. **Smart Suggestions**
   - AI-powered time slot suggestions based on:
     - User availability windows
     - Existing session conflicts
     - Priority levels
     - Spacing heuristics (avoid clustering)
     - Fatigue prevention (high-priority session distribution)
   - Accept or adjust suggestions

5. **Progress Tracking**
   - Overall statistics (scheduled, completed, completion rate)
   - Breakdown by session type
   - Average spacing between sessions
   - Visual progress indicators

## API Endpoints

### Session Types
- `GET /api/session-types` - List all session types
- `POST /api/session-types` - Create session type
- `GET /api/session-types/[id]` - Get session type
- `PUT /api/session-types/[id]` - Update session type
- `DELETE /api/session-types/[id]` - Delete session type

### Availability Windows
- `GET /api/availability` - List all availability windows
- `POST /api/availability` - Create availability window
- `DELETE /api/availability/[id]` - Delete availability window

### Sessions
- `GET /api/sessions` - List sessions (optional filters: completed, startDate, endDate)
- `POST /api/sessions` - Create session
- `GET /api/sessions/[id]` - Get session
- `PUT /api/sessions/[id]` - Update session
- `DELETE /api/sessions/[id]` - Delete session

### Suggestions
- `GET /api/suggestions?sessionTypeId=X&durationMinutes=60&lookAheadDays=7` - Get smart suggestions

### Progress
- `GET /api/progress` - Get progress statistics

## Assumptions and Limitations

### Assumptions

1. **Single User**: The application assumes a single user context (no multi-user support)
2. **Local Timezone**: All times are handled in the user's local timezone
3. **Session Duration**: Default session duration is 60 minutes, but can be customized
4. **Availability**: Users define availability in weekly recurring windows
5. **Priority Scale**: Priority ranges from 1 (lowest) to 5 (highest)

### Limitations

1. **No Authentication**: The app doesn't include user authentication (single-user assumption)
2. **No Offline Support**: Requires network connection to API
3. **No Push Notifications**: Session reminders not implemented
4. **Limited Calendar Integration**: No external calendar sync
5. **Basic UI**: Focus on functionality over pixel-perfect design
6. **No Animations**: Static UI without transitions
7. **SQLite Database**: File-based database (not suitable for production scaling)

## Testing

### Backend Tests

Run tests from the `api` directory:
```bash
cd api
npm test
```

### Mobile Tests

Run tests from the `mobile` directory:
```bash
cd mobile
npm test
```

## Development Notes

- **Functional Programming**: Uses Ramda for data transformations and functional composition
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Accessibility**: All interactive elements include proper accessibility labels and roles
- **Code Organization**: Follows Model-Controller-View pattern with clear separation of concerns
- **No Barrel Files**: Direct imports used instead of index.ts barrel files
- **Type Inference**: Types inferred from Prisma models where possible, avoiding redundant interfaces

## Deployment

### Backend

Deploy to Vercel, Netlify, or any Node.js hosting:
1. Update `DATABASE_URL` to production database (PostgreSQL recommended)
2. Run migrations: `npx prisma migrate deploy`
3. Deploy application

### Mobile

Build and deploy to app stores:
1. Update `EXPO_PUBLIC_API_URL` to production API
2. Build: `expo build:ios` or `expo build:android`
3. Submit to App Store / Play Store

## License

MIT

