# Style Guide

## Design Principles

This style guide defines the visual language for Smart Session Planner, ensuring consistency across all screens and components.

## Color Palette

### Primary Colors
- **Primary Blue**: `#1E3A8A` - Main actions, navigation, completed states
- **Primary Light**: `#3B82F6` - Interactive elements
- **Primary Dark**: `#1E40AF` - Pressed states

### Secondary Colors
- **Purple**: `#7C3AED` - Deep Work sessions
- **Green**: `#10B981` - Completed sessions, success states
- **Gray**: `#64748B` - Secondary text

### Background Colors
- **Main Background**: `#F8FAFC` - Screen backgrounds
- **Card Background**: `#FFFFFF` - Card surfaces
- **Section Background**: `#E0F2FE` - Progress sections

### Session Type Colors
- **Meditation**: Light green (`#A7F3D0`)
- **Meeting**: Light gray (`#E5E7EB`)
- **Deep Work**: Light purple (`#DDD6FE`)
- **Workout**: Light green (`#A7F3D0`)
- **Language**: Light blue (`#BFDBFE`)

## Typography

### Font Sizes
- **xs**: 12px - Labels, metadata
- **sm**: 14px - Secondary text
- **base**: 16px - Body text
- **lg**: 18px - Section headers
- **xl**: 20px - Card titles
- **2xl**: 24px - Page titles
- **3xl**: 30px - Large displays

### Font Weights
- **Regular (400)**: Body text
- **Medium (500)**: Emphasized text
- **Semibold (600)**: Section headers
- **Bold (700)**: Page titles, important labels

## Spacing

Consistent spacing scale based on 4px increments:
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Screen Edge Padding

All screens must maintain consistent padding from screen edges:
- **Horizontal (sides)**: 20px - Provides breathing room from left and right edges
- **Top**: 20px - Accounts for safe area and provides spacing from top edge
- **Bottom**: 48px - Extra padding at bottom to prevent content from touching bottom navigation or screen edge

This ensures content never touches screen edges and maintains visual consistency across all screens.

## Border Radius

- **sm**: 8px - Small elements
- **md**: 12px - Cards, buttons
- **lg**: 16px - Large cards
- **xl**: 24px - Extra large elements
- **full**: 9999px - Pills, circles

## Component Patterns

### Cards
- White background (`#FFFFFF`)
- Rounded corners (`12px`)
- Subtle shadow (md elevation)
- Padding: `16px` (md spacing)

### Buttons
- Primary: Dark blue background, white text
- Secondary: White background, dark text, border
- Border radius: `12px`
- Padding: `12px` vertical, `24px` horizontal

### Icons
- Size: `24px` for standard icons
- Color: Matches text color or primary color
- Circular backgrounds: `40px` diameter

### Navigation
- Bottom tab bar: White background
- Active tab: Dark blue icon and text
- Inactive tab: Gray icon and text
- Height: `60px` with safe area padding

## Accessibility

- All interactive elements must have proper accessibility labels
- Color contrast ratios meet WCAG AA standards
- Touch targets minimum `44x44px`
- Text scales with system font size preferences

