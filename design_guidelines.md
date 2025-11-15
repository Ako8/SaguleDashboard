# Property Booking Dashboard - Design Guidelines

## Design Approach
**System Selected:** Material Design - optimal for data-heavy, form-intensive business applications

**Key Principles:**
- Information density balanced with breathing room
- Clear visual hierarchy for complex data structures
- Consistent interaction patterns across all CRUD operations
- Responsive grid system that maintains usability across devices

## Typography Hierarchy

**Font Family:** Roboto (Material Design default)
- Primary: Roboto Regular, Medium, Bold
- Monospace: Roboto Mono for IDs, timestamps, codes

**Type Scale:**
- Page Titles: 32px/Bold (h4)
- Section Headers: 24px/Medium (h5)
- Card Titles: 20px/Medium (h6)
- Body Text: 16px/Regular
- Secondary Text: 14px/Regular
- Caption/Helper Text: 12px/Regular
- Button Text: 14px/Medium, uppercase

## Layout System

**Spacing Units:** Use Material-UI's 8px base unit system
- Common spacing: `spacing(1)=8px, (2)=16px, (3)=24px, (4)=32px, (6)=48px`
- Page padding: 24px mobile, 32px tablet, 48px desktop
- Card padding: 16px mobile, 24px desktop
- Section gaps: 32px vertical spacing between major sections
- Form field spacing: 16px between fields, 24px between field groups

**Grid System:**
- Desktop: 12-column grid, max-width 1440px
- Tablet: 8-column grid
- Mobile: 4-column grid, full-width containers

## Component Library

### Navigation
**Sidebar (Drawer):**
- Width: 240px permanent drawer (desktop), temporary overlay (mobile)
- Item height: 48px with 16px left padding
- Active state: Subtle background fill, bold text
- Icons: 24px Material Icons, positioned 16px from left edge
- Group headers: 12px uppercase, 48px top margin

**Top Header (AppBar):**
- Height: 64px
- Avatar: 40px circular with 8px right margin
- Notification badge: 20px circular positioned top-right on bell icon

### Cards & Containers
**Property Cards:**
- Aspect ratio: 16:9 for cover image
- Border radius: 4px
- Elevation: 1 (default), 4 (hover)
- Content padding: 16px
- Image overlay for status badges: top-right 8px offset

**Data Tables:**
- Row height: 52px (dense: 40px)
- Column padding: 16px
- Sortable headers with arrow icons
- Striped rows for large datasets (alternating subtle background)
- Sticky headers for scrollable tables

### Forms
**Multi-Tab Forms:**
- Tab height: 48px
- Active tab: underline indicator 2px height
- Tab content padding: 24px all sides
- Field groups: 24px vertical separation
- Two-column layout on desktop (>960px), single column mobile

**Input Fields:**
- Height: 56px (standard), 40px (dense)
- Label: floating/shrinking on focus
- Helper text: 12px, 4px top margin
- Error state: red outline with error message below

### Buttons
**Primary Actions:**
- Height: 36px (contained), minimum width 64px
- Padding: 8px 16px
- Border radius: 4px
- Icon + text: icon 18px, 8px gap

**FAB (Floating Action Button):**
- Size: 56px diameter (regular), 40px (mini)
- Position: fixed bottom-right, 16px offset
- Use for primary action: "Add Property", "Create Booking"

### Modals & Dialogs
- Max-width: 600px (form dialogs), 900px (detail views)
- Padding: 24px
- Title: 20px/Medium, 24px bottom margin
- Actions: right-aligned, 8px gap between buttons
- Backdrop: semi-transparent overlay

### Calendar Component
**Month View:**
- Cell height: minimum 100px
- Event height: 24px with 2px vertical gap
- Color-coded status: left border 4px accent
- Overflow: "+X more" text for multiple events

### Data Visualization
**Charts (Recharts):**
- Container height: 300px (dashboard), 400px (full page)
- Grid lines: subtle dividers
- Tooltips: 14px text, rounded 4px container
- Legend: positioned below chart, 12px text

### Status Indicators
**Chips/Badges:**
- Height: 24px
- Border radius: 12px (fully rounded)
- Padding: 0 12px
- Use for: status, property type, room count

**Status Colors Pattern:**
- Success states: green accent
- Warning states: amber accent  
- Error states: red accent
- Info states: blue accent
- Neutral: gray

## Images

**Property/Room Photos:**
- Hero images: 16:9 aspect ratio, minimum 1200x675px
- Thumbnail grid: 1:1 aspect ratio, 300x300px
- Maximum 10 images per property
- Upload zone: dashed border, centered icon and text
- Gallery lightbox: full-screen overlay with navigation arrows

**Profile Photos:**
- Avatar: 40px (header), 80px (profile page)
- Circular crop
- Placeholder: initials on colored background

**Empty States:**
- Illustration or icon: 200px max dimension
- Centered layout with descriptive text below
- Call-to-action button 16px below text

## Responsive Breakpoints

**Desktop (1280px+):**
- 3-column property grid
- Side-by-side form layouts
- Permanent sidebar visible

**Tablet (960px-1279px):**
- 2-column property grid  
- Stacked form sections
- Permanent sidebar visible

**Mobile (<960px):**
- Single column layouts
- Bottom sheet for filters
- Hamburger menu sidebar
- Floating labels for space efficiency
- Touch targets minimum 48x48px

## Loading & Empty States

**Skeleton Screens:**
- Match component dimensions
- Pulse animation duration: 1.5s
- Use for: tables, cards, forms on initial load

**Progress Indicators:**
- Circular: centered, 40px for full-page
- Linear: 4px height, top of container
- File upload: determinate progress bar 8px height

**Empty States:**
- Icon 48px centered
- Title 20px/Medium, 16px below icon
- Description 14px/Regular, 8px below title
- Action button 24px below description