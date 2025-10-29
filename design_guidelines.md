# Design Guidelines: Work Schedule & Travel Management Dashboard

## Design Approach

**Selected Approach**: Design System + Reference-Based Hybrid

**Primary References**:
- **Linear**: Clean, modern interface with excellent typography and status indicators
- **Notion**: Card-based organization and intuitive task management
- **Material Design**: Real-time feedback patterns and state indicators

**Core Principles**:
- **Clarity First**: Schedule information must be instantly readable
- **Status Awareness**: Current state always visible at a glance
- **Efficient Interactions**: Minimal clicks for confirmations and updates
- **Mobile-Optimized**: Nathan needs access while traveling

---

## Typography System

**Font Families** (via Google Fonts):
- **Primary**: Inter (400, 500, 600, 700) - UI text, labels, body
- **Display**: Inter (700) - Large numbers, time displays
- **Monospace**: JetBrains Mono (500) - Time stamps, precise data

**Type Scale**:
- **Hero Time Display**: text-6xl font-bold (current time/task)
- **Location Headers**: text-3xl font-semibold
- **Task Titles**: text-xl font-semibold
- **Time Labels**: text-lg font-mono
- **Body Text**: text-base font-normal
- **Metadata**: text-sm font-medium
- **Micro Labels**: text-xs font-medium uppercase tracking-wide

---

## Layout System

**Spacing Primitives** (Tailwind units):
- **Primary spacing**: 4, 6, 8 units (p-4, m-6, gap-8)
- **Section spacing**: 12, 16 units (py-12, mb-16)
- **Micro spacing**: 2, 3 units (gap-2, px-3)

**Grid Structure**:
- **Main Container**: max-w-7xl mx-auto px-4 lg:px-8
- **Dashboard Layout**: Two-column on desktop (2/3 main, 1/3 sidebar), single-column mobile
- **Timeline Cards**: Full-width stacked on mobile, maintain chronological flow

---

## Component Library

### A. Navigation & Header
**Top Navigation Bar**:
- Fixed header with logo/title on left
- Operator name (Nathan) with avatar on right
- Current date and live clock in center
- Notification bell icon for alerts
- Height: h-16, subtle border-bottom

### B. Dashboard Components

**Current Task Card** (Hero Section):
- Large, prominent card at top of main content
- Display current location/task with large typography
- Live countdown timer to next event
- Status badge (On Time / Delayed / Break)
- Confirmation button (prominent, easily tappable)
- Padding: p-8, rounded-2xl

**Timeline View**:
- Vertical timeline with connecting lines
- Each task as a card with:
  - Time (left-aligned, monospace)
  - Location with icon
  - Travel duration indicator
  - Status indicator (confirmed/pending/missed)
  - Task type badge (Travel/Work/Break)
- Cards: p-6, rounded-xl, gap-4 between items

**Quick Stats Panel** (Sidebar):
- Total locations visited today
- Total travel time
- Tasks completed/remaining
- On-time performance percentage
- Compact cards: p-4, rounded-lg, gap-3

**Map Preview Component**:
- Embedded map showing current location and next destination
- Route visualization
- ETA display
- Compact view: h-64, rounded-xl

### C. Interactive Elements

**Confirmation Buttons**:
- Primary action: Large tap-friendly buttons (min h-12)
- Clear labels: "Confirm Arrival" / "Start Next Task"
- Loading states for processing
- Success/error feedback

**Status Indicators**:
- Circular badges with icons
- Green dot: Confirmed/On-time
- Yellow dot: Pending confirmation
- Red dot: Delayed/Missed
- Size: w-3 h-3 for dots, w-8 h-8 for icon badges

**Time Display Components**:
- Countdown timers with progress rings
- ETA badges with clock icons
- Duration pills (e.g., "15 min travel")

### D. Data Display

**Location Cards**:
- Location name with pin icon
- Address (if needed)
- Expected arrival/departure times
- Travel distance from previous location
- Layout: Horizontal on desktop, vertical on mobile

**Delay Warning Panel**:
- Appears when Nathan misses confirmation
- Shows recalculated schedule impact
- Action buttons: "Acknowledge" / "View Updated Schedule"
- Padding: p-6, border-left accent

**Daily Summary**:
- Collapsible section at bottom
- List view of all completed tasks
- Total statistics
- Export/share options

### E. Modals & Overlays

**Schedule Regeneration Modal**:
- Triggered on delays
- Shows old vs. new schedule comparison
- Accept/Reject options
- Centered overlay: max-w-2xl

**Notification Toasts**:
- Slide from top-right
- Auto-dismiss after 5 seconds
- Action button for urgent items
- Compact: p-4, rounded-lg

---

## Responsive Behavior

**Desktop (lg: 1024px+)**:
- Two-column dashboard layout
- Sidebar always visible
- Map preview integrated
- Timeline shows 8-10 items at once

**Tablet (md: 768px)**:
- Single column, prioritize current task
- Sidebar becomes collapsible drawer
- Timeline shows 5-6 items
- Touch-optimized buttons

**Mobile (base)**:
- Stack all components vertically
- Current task takes 70% of initial viewport
- Quick-access bottom navigation
- Swipe gestures for timeline navigation
- Minimum touch targets: 44px

---

## Animations & Transitions

**Use Sparingly**:
- Smooth transitions for status changes (transition-all duration-300)
- Countdown timer updates (no jarring jumps)
- Page transitions: Simple fade (opacity) or slide
- Loading spinners for confirmations

**Avoid**:
- Complex entrance animations
- Parallax effects
- Decorative animations
- Auto-playing elements

---

## Accessibility

- **High contrast** for time-critical information
- **Clear focus states** on all interactive elements (ring-2 ring-offset-2)
- **ARIA labels** for all status indicators
- **Keyboard navigation** for entire interface
- **Screen reader announcements** for status changes
- **Color-blind safe** status indicators (use icons + text, not just colors)

---

## Icons

**Library**: Heroicons (via CDN)
- Location pin, clock, check-circle, exclamation-triangle
- Arrow-right for navigation
- Bell for notifications
- Map-pin for locations
- Clock for time indicators

---

## Images

This application does **not require images**. Focus is on clean, data-driven interface with icons and typography for clarity and performance.