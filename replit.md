# Work Schedule & Travel Management Dashboard

## Overview

A real-time work schedule and travel management application for Nathan, designed to optimize daily work routes across multiple locations. The system automatically generates daily schedules, calculates travel times, tracks task completion, and provides live status updates. Built as a single-page dashboard application with mobile-first responsive design.

**Core Features:**
- Automatic daily schedule generation based on work locations
- Real-time task tracking and confirmation
- Travel time calculation between locations
- Delay reporting and automatic schedule recalculation
- Live countdown timers and status indicators
- Mobile-optimized interface for on-the-go access

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack:**
- React 18 with TypeScript
- Vite for build tooling and development server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management

**UI Component System:**
- Shadcn/ui component library (Radix UI primitives)
- Tailwind CSS for styling with custom design tokens
- Custom component variants using class-variance-authority
- Design references: Linear (clean interface), Notion (card-based organization), Material Design (real-time feedback)

**Typography:**
- Primary: Inter font family (Google Fonts)
- Monospace: JetBrains Mono for time displays
- Custom spacing system based on Tailwind units

**State Management:**
- React Query for API data caching and synchronization
- Auto-refetching on 30-second intervals for schedule updates
- Optimistic updates for task confirmations
- Local component state for UI interactions

**Key UI Patterns:**
- Card-based layout for task organization
- Timeline visualization for daily schedule
- Real-time countdown timers using date-fns
- Status badges with color-coded states (pending, confirmed, delayed, missed)
- Toast notifications for user feedback

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- HTTP server for REST API endpoints
- Custom middleware for request logging and JSON parsing

**API Design:**
- RESTful endpoints under `/api` prefix
- Primary endpoints:
  - `GET /api/schedule/today` - Current day's schedule
  - `GET /api/schedule/:date` - Schedule for specific date
  - `POST /api/tasks/:id/confirm` - Confirm task arrival
  - `POST /api/tasks/:id/delay` - Report delay and recalculate

**Schedule Generation Logic:**
- Automatic daily schedule creation on first request
- Time-slot based algorithm (8:00-19:00 working hours)
- Travel time calculations between locations
- Break periods (lunch at 13:40)
- Smart task sequencing to minimize travel time

**Data Storage:**
- In-memory storage implementation (MemStorage class)
- Interface-based design allows future database migration
- Schema-driven data models using Drizzle ORM types

**Schema Structure:**
- Locations: Work sites with unique IDs
- Travel Times: Duration between location pairs
- Tasks: Individual work/travel/break items with status tracking
- Schedules: Daily schedule containers linking to tasks

### Data Layer

**ORM & Validation:**
- Drizzle ORM configured for PostgreSQL (via Neon serverless)
- Zod schemas for runtime validation
- Type-safe database operations with TypeScript inference
- Migration support via drizzle-kit

**Database Schema:**
- `locations` - Work location master data
- `travel_times` - Precalculated travel durations between locations
- `tasks` - Schedule items with type (work/travel/break), time slots, and status
- `schedules` - Daily schedule metadata (date, operator, generation time)

**Data Flow:**
- Server generates schedules on-demand if not exists
- Client polls for updates every 30 seconds
- Task confirmations update server state immediately
- Delay reports trigger schedule recalculation

### External Dependencies

**Core Runtime:**
- Node.js environment
- PostgreSQL database via @neondatabase/serverless
- Drizzle ORM for database operations

**UI Libraries:**
- @radix-ui/* components (18+ packages for accessible primitives)
- date-fns for date manipulation and formatting
- lucide-react for iconography
- embla-carousel-react for carousel functionality
- cmdk for command palette pattern

**Development Tools:**
- TypeScript for type safety
- Vite with React plugin
- @replit/vite-plugin-* for Replit integration
- esbuild for production bundling

**Third-Party Services:**
- Neon Database (PostgreSQL serverless)
- Google Fonts API (Inter, JetBrains Mono)

**Session Management:**
- connect-pg-simple for PostgreSQL-backed sessions (configured but not actively used in current implementation)

**Build & Deployment:**
- Development: tsx for TypeScript execution
- Production: esbuild bundling with ESM output
- Static assets served from dist/public
- Environment-based configuration (DATABASE_URL required)