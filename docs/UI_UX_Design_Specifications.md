# UI/UX Design Specifications
## ConnectHub Social Media Platform

**Version:** 1.0  
**Date:** February 12, 2026  
**Status:** Complete - Ready for Implementation

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Design Philosophy](#2-design-philosophy)
3. [Design System](#3-design-system)
4. [Color Palette](#4-color-palette)
5. [Typography](#5-typography)
6. [Spacing & Layout](#6-spacing--layout)
7. [Component Library](#7-component-library)
8. [Page Layouts & Wireframes](#8-page-layouts--wireframes)
9. [User Flows](#9-user-flows)
10. [Responsive Design](#10-responsive-design)
11. [Accessibility Guidelines](#11-accessibility-guidelines)
12. [Animation & Interactions](#12-animation--interactions)
13. [Icon Library](#13-icon-library)
14. [Design Patterns](#14-design-patterns)
15. [Mobile App Design](#15-mobile-app-design)
16. [Design Deliverables](#16-design-deliverables)
17. [Brand Guidelines](#17-brand-guidelines)
18. [Appendix](#18-appendix)

---

## 1. Introduction

### 1.1 Purpose

This document defines the complete UI/UX design specifications for ConnectHub, ensuring consistency across all touchpoints and providing clear guidelines for designers and developers.

### 1.2 Scope

**Covers:**
- Design system and principles
- Component specifications
- Page layouts and wireframes
- User flows and interactions
- Responsive behavior
- Accessibility standards
- Animation guidelines

**Platforms:**
- Web (Desktop & Mobile)
- Mobile Apps (iOS & Android) - Phase 2
- Progressive Web App (PWA)

### 1.3 Design Goals

1. **Simplicity:** Clean, uncluttered interface
2. **Consistency:** Unified experience across platform
3. **Accessibility:** WCAG 2.1 Level AA compliance
4. **Performance:** Fast, responsive interactions
5. **Engagement:** Delightful user experience
6. **Scalability:** Design system that grows

### 1.4 Target Users

- **Age:** 18-45 years
- **Tech Savvy:** Basic to advanced
- **Usage:** Mobile-first (70%), Desktop (30%)
- **Accessibility Needs:** Visual, motor, cognitive considerations

---

## 2. Design Philosophy

### 2.1 Core Principles

**1. Content First**
- Content takes priority over chrome
- Minimal UI elements
- Focus on user-generated content
- Clear visual hierarchy

**2. Human-Centered**
- Empathetic design
- Clear, helpful messaging
- Forgiving interactions
- Respect user's time and attention

**3. Familiar Yet Fresh**
- Leverage known patterns
- Add unique personality
- Balance innovation with usability
- Consistent with platform conventions

**4. Performance-Minded**
- Fast loading times
- Smooth animations (60fps)
- Optimistic UI updates
- Progressive enhancement

**5. Inclusive by Default**
- Accessible to all users
- Multiple input methods
- Clear contrast ratios
- Keyboard navigation

### 2.2 Design Values

```
SIMPLE â†â†’ POWERFUL
Clear, focused interface with advanced capabilities when needed

PLAYFUL â†â†’ PROFESSIONAL  
Friendly, approachable yet trustworthy and reliable

MINIMAL â†â†’ EXPRESSIVE
Clean aesthetics that allow user content to shine

FAMILIAR â†â†’ INNOVATIVE
Comfort of known patterns with delightful surprises
```

### 2.3 Visual Language

**Metaphors:**
- Conversations (messaging)
- Following (connections)
- Feeds (content streams)
- Profiles (identity)
- Spaces (communities)

**Tone:**
- Friendly and approachable
- Clear and direct
- Encouraging and positive
- Respectful and inclusive

---

## 3. Design System

### 3.1 Design Tokens

Design tokens are the atomic design decisions that make up the design system.

**Token Categories:**
1. Color
2. Typography
3. Spacing
4. Sizing
5. Borders
6. Shadows
7. Animation
8. Breakpoints

**Token Structure:**
```
{category}-{property}-{variant}-{state}

Examples:
color-primary-500
spacing-md
border-radius-lg
shadow-elevation-2
```

### 3.2 Atomic Design Methodology

```
ATOMS â†’ MOLECULES â†’ ORGANISMS â†’ TEMPLATES â†’ PAGES

Atoms: Button, Input, Icon, Avatar
Molecules: Input with Label, Search Bar, User Card
Organisms: Navigation Bar, Post Card, Comment Section
Templates: Feed Layout, Profile Layout, Settings Layout
Pages: Home Page, Profile Page, Messages Page
```

### 3.3 Component Hierarchy

**Level 1 - Primitives:**
- Box, Text, Icon, Image

**Level 2 - Elements:**
- Button, Input, Checkbox, Radio, Switch, Badge

**Level 3 - Components:**
- Card, Modal, Dropdown, Tooltip, Notification

**Level 4 - Patterns:**
- Post Composer, Comment Thread, User Profile Header

**Level 5 - Pages:**
- Home Feed, Explore, Messages, Profile

---

## 4. Color Palette

### 4.1 Primary Colors

**Brand Primary (Blue)**
```
primary-50:  #E3F2FD  (lightest)
primary-100: #BBDEFB
primary-200: #90CAF9
primary-300: #64B5F6
primary-400: #42A5F5
primary-500: #2196F3  â† Primary brand color
primary-600: #1E88E5
primary-700: #1976D2
primary-800: #1565C0
primary-900: #0D47A1  (darkest)
```

**Usage:**
- Primary actions (Post, Follow, Send buttons)
- Links and interactive elements
- Active states
- Brand presence

### 4.2 Secondary Colors

**Accent (Purple)**
```
accent-50:  #F3E5F5
accent-100: #E1BEE7
accent-200: #CE93D8
accent-300: #BA68C8
accent-400: #AB47BC
accent-500: #9C27B0  â† Accent color
accent-600: #8E24AA
accent-700: #7B1FA2
accent-800: #6A1B9A
accent-900: #4A148C
```

**Usage:**
- Notifications badge
- Premium features
- Special highlights
- Call-to-action variations

### 4.3 Semantic Colors

**Success (Green)**
```
success-500: #4CAF50
success-700: #388E3C
```
- Success messages
- Confirmed actions
- Positive indicators

**Warning (Orange)**
```
warning-500: #FF9800
warning-700: #F57C00
```
- Warning messages
- Pending states
- Caution indicators

**Error (Red)**
```
error-500: #F44336
error-700: #D32F2F
```
- Error messages
- Destructive actions
- Critical alerts

**Info (Blue)**
```
info-500: #2196F3
info-700: #1976D2
```
- Informational messages
- Help tooltips
- Neutral notifications

### 4.4 Neutral Colors

**Grayscale**
```
neutral-0:   #FFFFFF  (white)
neutral-50:  #FAFAFA
neutral-100: #F5F5F5  â† Background light
neutral-200: #EEEEEE
neutral-300: #E0E0E0  â† Borders
neutral-400: #BDBDBD
neutral-500: #9E9E9E  â† Disabled text
neutral-600: #757575
neutral-700: #616161  â† Secondary text
neutral-800: #424242
neutral-900: #212121  â† Primary text
neutral-1000: #000000  (black)
```

### 4.5 Social Colors

```
like-color:     #E91E63  (Pink)
share-color:    #4CAF50  (Green)
bookmark-color: #FFC107  (Amber)
```

### 4.6 Dark Mode Colors

**Primary Colors (Dark Theme)**
```
primary-dark-500: #42A5F5  (brighter for dark bg)
accent-dark-500:  #CE93D8
```

**Backgrounds (Dark Theme)**
```
bg-primary:   #121212  â† Main background
bg-secondary: #1E1E1E  â† Cards, modals
bg-tertiary:  #2C2C2C  â† Hover states
```

**Text (Dark Theme)**
```
text-primary:   #FFFFFF
text-secondary: #B3B3B3
text-disabled:  #666666
```

### 4.7 Color Usage Guidelines

**Accessibility:**
- Text on background: minimum 4.5:1 contrast
- Large text (18pt+): minimum 3:1 contrast
- UI components: minimum 3:1 contrast

**Color Blindness:**
- Never use color alone to convey information
- Combine with icons, labels, or patterns
- Test with color blindness simulators

**Light vs Dark Mode:**
- All colors have dark mode variants
- Maintain contrast ratios in both themes
- Test readability in both modes

---

## 5. Typography

### 5.1 Font Families

**Primary Font: Inter**
```
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 
             sans-serif;
```

**Why Inter:**
- Excellent readability at all sizes
- Comprehensive weights (100-900)
- Open source and web-optimized
- Great for UI and long-form content

**Monospace Font: JetBrains Mono**
```
font-family: 'JetBrains Mono', 'Courier New', monospace;
```

**Usage:**
- Code snippets
- Technical content
- API responses

### 5.2 Type Scale

**Desktop:**
```
heading-1:   48px / 56px (3rem / 3.5rem)   - font-weight: 700
heading-2:   40px / 48px (2.5rem / 3rem)   - font-weight: 700
heading-3:   32px / 40px (2rem / 2.5rem)   - font-weight: 600
heading-4:   24px / 32px (1.5rem / 2rem)   - font-weight: 600
heading-5:   20px / 28px (1.25rem / 1.75rem) - font-weight: 600
heading-6:   16px / 24px (1rem / 1.5rem)   - font-weight: 600

body-lg:     18px / 28px (1.125rem / 1.75rem) - font-weight: 400
body:        16px / 24px (1rem / 1.5rem)    - font-weight: 400
body-sm:     14px / 20px (0.875rem / 1.25rem) - font-weight: 400
caption:     12px / 16px (0.75rem / 1rem)   - font-weight: 400
overline:    12px / 16px (0.75rem / 1rem)   - font-weight: 600 uppercase
```

**Mobile:**
```
heading-1:   36px / 44px
heading-2:   32px / 40px
heading-3:   28px / 36px
heading-4:   24px / 32px
heading-5:   20px / 28px
heading-6:   16px / 24px

body:        16px / 24px
body-sm:     14px / 20px
caption:     12px / 16px
```

### 5.3 Font Weights

```
thin:        100
extra-light: 200
light:       300
regular:     400  â† Default
medium:      500
semi-bold:   600  â† Headings
bold:        700  â† Emphasis
extra-bold:  800
black:       900
```

### 5.4 Text Styles

**Emphasis:**
- **Bold:** `font-weight: 600` or `700`
- *Italic:* `font-style: italic`
- Underline: Reserved for links only

**Links:**
```
color: primary-600
text-decoration: none
hover: text-decoration: underline
```

**Uppercase:**
- Use sparingly (labels, buttons, overline)
- Always with `letter-spacing: 0.5px`

**Line Height:**
- Headings: 1.2 to 1.4
- Body text: 1.5 to 1.75
- Captions: 1.3 to 1.5

### 5.5 Text Truncation

**Single Line:**
```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

**Multiple Lines (2 lines):**
```css
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
```

---

## 6. Spacing & Layout

### 6.1 Spacing Scale

**8-Point Grid System**
```
xs:   4px  (0.25rem)
sm:   8px  (0.5rem)
md:   16px (1rem)     â† Base unit
lg:   24px (1.5rem)
xl:   32px (2rem)
2xl:  40px (2.5rem)
3xl:  48px (3rem)
4xl:  64px (4rem)
5xl:  80px (5rem)
6xl:  96px (6rem)
```

**Usage:**
- Component padding: 16px (md)
- Section spacing: 32px (xl)
- Page margins: 24px (lg) mobile, 48px (3xl) desktop

### 6.2 Layout Grid

**Desktop (1200px+):**
```
Columns: 12
Gutter: 24px
Margin: 48px
Max-width: 1440px
```

**Tablet (768px - 1199px):**
```
Columns: 8
Gutter: 16px
Margin: 32px
```

**Mobile (< 768px):**
```
Columns: 4
Gutter: 16px
Margin: 16px
```

### 6.3 Container Widths

```
container-sm:  640px
container-md:  768px
container-lg:  1024px
container-xl:  1280px
container-2xl: 1440px  â† Max content width
```

### 6.4 Z-Index Scale

```
z-dropdown:     1000
z-sticky:       1020
z-fixed:        1030
z-modal-backdrop: 1040
z-modal:        1050
z-popover:      1060
z-tooltip:      1070
z-notification: 1080
```

### 6.5 Border Radius

```
radius-none: 0
radius-sm:   4px
radius-md:   8px   â† Default
radius-lg:   12px
radius-xl:   16px
radius-2xl:  24px
radius-full: 9999px  (pill shape)
```

### 6.6 Elevation (Shadows)

**Shadows create depth and hierarchy**

```css
/* Elevation 0 - Flat */
shadow-none: none;

/* Elevation 1 - Raised */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Elevation 2 - Card */
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Elevation 3 - Dropdown */
shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

/* Elevation 4 - Modal */
shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

/* Elevation 5 - Popover */
shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
```

**Usage:**
- Cards: shadow-md
- Buttons (hover): shadow-sm
- Dropdowns: shadow-lg
- Modals: shadow-xl
- Tooltips: shadow-lg

---

## 7. Component Library

### 7.1 Button Component

**Variants:**

**Primary Button**
```
Background: primary-500
Text: white
Border: none
Padding: 12px 24px
Border-radius: 8px
Font-weight: 600
Font-size: 16px

Hover: primary-600, shadow-sm
Active: primary-700
Disabled: neutral-300, text: neutral-500
```

**Secondary Button**
```
Background: transparent
Text: primary-600
Border: 2px solid primary-600
Padding: 10px 22px (to account for border)

Hover: background: primary-50
Active: background: primary-100
```

**Tertiary/Ghost Button**
```
Background: transparent
Text: primary-600
Border: none
Padding: 12px 24px

Hover: background: neutral-100
Active: background: neutral-200
```

**Destructive Button**
```
Background: error-500
Text: white
(same spacing as primary)

Hover: error-600
Active: error-700
```

**Sizes:**
```
small:  padding: 8px 16px, font-size: 14px
medium: padding: 12px 24px, font-size: 16px (default)
large:  padding: 16px 32px, font-size: 18px
```

**Icon Buttons:**
```
Size: 40px Ã— 40px
Icon size: 20px
Border-radius: full (circle)
Center aligned

Hover: background: neutral-100
```

### 7.2 Input Component

**Text Input**
```
Height: 48px
Padding: 12px 16px
Border: 1px solid neutral-300
Border-radius: 8px
Font-size: 16px

Focus: border: 2px solid primary-500
       outline: none
       shadow: 0 0 0 3px primary-100

Error: border: 2px solid error-500
       shadow: 0 0 0 3px error-100

Disabled: background: neutral-100
          text: neutral-500
```

**Label:**
```
Font-size: 14px
Font-weight: 600
Color: neutral-900
Margin-bottom: 8px
```

**Helper Text:**
```
Font-size: 14px
Color: neutral-600
Margin-top: 4px
```

**Error Message:**
```
Font-size: 14px
Color: error-600
Margin-top: 4px
Icon: error icon before text
```

**Textarea:**
```
Min-height: 120px
Resize: vertical
(other properties same as input)
```

### 7.3 Checkbox & Radio

**Checkbox:**
```
Size: 20px Ã— 20px
Border: 2px solid neutral-400
Border-radius: 4px

Checked: background: primary-500
         border: primary-500
         checkmark: white

Focus: outline: 2px solid primary-300
```

**Radio:**
```
Size: 20px Ã— 20px
Border: 2px solid neutral-400
Border-radius: full

Selected: border: primary-500 (6px width)
          inner dot: primary-500
```

### 7.4 Switch (Toggle)

```
Width: 44px
Height: 24px
Background: neutral-300
Border-radius: full

Handle: 20px circle, white
        Position: left (off), right (on)

On state: background: primary-500
Transition: 200ms ease
```

### 7.5 Avatar

**Sizes:**
```
xs:  24px
sm:  32px
md:  40px  â† Default
lg:  48px
xl:  64px
2xl: 96px
3xl: 128px
```

**Variants:**
- Image avatar (border-radius: full)
- Initials avatar (background: gradient, text: white)
- Icon avatar (default user icon)

**Status Indicator:**
```
Size: 25% of avatar size
Position: bottom-right
Border: 2px solid background

Online: background: success-500
Away: background: warning-500
Offline: background: neutral-400
```

### 7.6 Badge

**Default Badge:**
```
Padding: 4px 8px
Border-radius: 12px (pill)
Font-size: 12px
Font-weight: 600

Primary: background: primary-100, text: primary-700
Success: background: success-100, text: success-700
Warning: background: warning-100, text: warning-700
Error: background: error-100, text: error-700
```

**Notification Badge (Dot):**
```
Size: 8px Ã— 8px
Border-radius: full
Background: error-500
Position: top-right of parent
Border: 2px solid background (white)
```

**Count Badge:**
```
Min-width: 20px
Height: 20px
Padding: 0 6px
Border-radius: full
Background: error-500
Text: white, 12px, bold
Position: top-right

If count > 99: show "99+"
```

### 7.7 Card

**Default Card:**
```
Background: white
Border: 1px solid neutral-200
Border-radius: 12px
Padding: 24px
Shadow: shadow-sm

Hover: shadow-md (if interactive)
```

**Compact Card:**
```
Padding: 16px
Border-radius: 8px
```

**Post Card (Special):**
```
Border: 1px solid neutral-200
Border-radius: 0 (flat for feed)
Padding: 16px
Hover: background: neutral-50

Mobile: border-left: 0, border-right: 0
```

### 7.8 Modal

**Overlay:**
```
Background: rgba(0, 0, 0, 0.5)
Backdrop-filter: blur(4px)
Z-index: 1040
```

**Modal Container:**
```
Background: white
Border-radius: 16px
Max-width: 600px
Padding: 24px
Shadow: shadow-2xl
Z-index: 1050

Animation: scale from 0.9 to 1, fade in
```

**Modal Header:**
```
Margin-bottom: 16px
Font-size: 24px
Font-weight: 700
```

**Modal Footer:**
```
Margin-top: 24px
Display: flex
Justify-content: flex-end
Gap: 12px
```

### 7.9 Dropdown

**Menu Container:**
```
Background: white
Border: 1px solid neutral-200
Border-radius: 8px
Shadow: shadow-lg
Min-width: 200px
Padding: 8px
```

**Menu Item:**
```
Padding: 12px 16px
Border-radius: 6px
Font-size: 14px

Hover: background: neutral-100
Active: background: neutral-200
```

**Divider:**
```
Height: 1px
Background: neutral-200
Margin: 8px 0
```

### 7.10 Tooltip

```
Background: neutral-900
Color: white
Padding: 8px 12px
Border-radius: 6px
Font-size: 14px
Max-width: 200px
Shadow: shadow-lg
Z-index: 1070

Arrow: 6px triangle, neutral-900
```

**Positioning:**
- Top (default)
- Bottom
- Left
- Right

### 7.11 Toast/Notification

```
Background: white
Border-left: 4px solid (variant color)
Border-radius: 8px
Padding: 16px
Shadow: shadow-lg
Max-width: 400px
Position: fixed, top-right
Z-index: 1080

Success: border-color: success-500
Warning: border-color: warning-500
Error: border-color: error-500
Info: border-color: info-500

Animation: slide-in from right
Auto-dismiss: 5 seconds
```

### 7.12 Progress Indicators

**Linear Progress:**
```
Height: 4px
Background: neutral-200
Border-radius: full

Fill: background: primary-500
      animated: shimmer effect
```

**Circular Progress (Spinner):**
```
Size: 32px (default)
Border: 3px
Color: primary-500
Animation: rotate 1s linear infinite
```

**Skeleton Loader:**
```
Background: neutral-200
Border-radius: 8px
Animation: pulse (shimmer effect)

Shapes:
- Text: height: 16px, width: variable
- Avatar: circle, 40px
- Card: height: 200px, width: 100%
```

---

## 8. Page Layouts & Wireframes

### 8.1 Home Feed Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Header (Navigation)                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚       â”‚  â”‚                 â”‚  â”‚         â”‚  â”‚
â”‚  â”‚  Nav  â”‚  â”‚   Feed Area     â”‚  â”‚ Sidebar â”‚  â”‚
â”‚  â”‚ Left  â”‚  â”‚                 â”‚  â”‚ Right   â”‚  â”‚
â”‚  â”‚       â”‚  â”‚  Post Composer  â”‚  â”‚         â”‚  â”‚
â”‚  â”‚ 240px â”‚  â”‚                 â”‚  â”‚  320px  â”‚  â”‚
â”‚  â”‚       â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚         â”‚  â”‚
â”‚  â”‚       â”‚  â”‚  â”‚ Post Card â”‚  â”‚  â”‚ Trends  â”‚  â”‚
â”‚  â”‚       â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚         â”‚  â”‚
â”‚  â”‚       â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚ Who to  â”‚  â”‚
â”‚  â”‚       â”‚  â”‚  â”‚ Post Card â”‚  â”‚  â”‚ Follow  â”‚  â”‚
â”‚  â”‚       â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚         â”‚  â”‚
â”‚  â”‚       â”‚  â”‚      ...        â”‚  â”‚         â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

Desktop: 3-column layout
Tablet: 2-column (hide right sidebar)
Mobile: 1-column (hide both sidebars)
```

**Components:**

**1. Header/Navigation (Fixed Top)**
- Height: 64px
- Background: white
- Border-bottom: 1px solid neutral-200
- Contains: Logo, Search, Nav Icons, Profile Menu

**2. Left Sidebar (Desktop only)**
- Width: 240px
- Fixed position
- Navigation links
- User profile summary

**3. Feed Area (Center)**
- Max-width: 600px
- Post composer at top
- Infinite scroll of posts

**4. Right Sidebar (Desktop only)**
- Width: 320px
- Fixed position
- Trending topics
- Suggested users
- Footer links

### 8.2 User Profile Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Header (Navigation)                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                 â”‚
â”‚         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”               â”‚
â”‚         â”‚   Cover Photo         â”‚               â”‚
â”‚         â”‚                       â”‚               â”‚
â”‚         â”‚    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚               â”‚
â”‚         â”‚    â”‚  Avatar  â”‚       â”‚               â”‚
â”‚         â””â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚
â”‚              â”‚   Name    â”‚                      â”‚
â”‚              â”‚ @username â”‚                      â”‚
â”‚              â”‚    Bio    â”‚                      â”‚
â”‚              â”‚  Follow   â”‚                      â”‚
â”‚              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚  â”‚  Tabs: Posts | Replies | Media      â”‚        â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤        â”‚
â”‚  â”‚                                     â”‚        â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚        â”‚
â”‚  â”‚  â”‚ Post Card â”‚  â”‚ Post Card â”‚      â”‚        â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚        â”‚
â”‚  â”‚                                     â”‚        â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â”‚                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Sections:**

**1. Profile Header**
- Cover photo: 1500px Ã— 500px
- Avatar: 128px, overlap cover by 50%
- Name, username, bio
- Stats: posts, followers, following
- Action buttons: Follow/Edit Profile

**2. Profile Tabs**
- Posts (all posts)
- Replies (comments)
- Media (images/videos only)
- Likes (liked posts) - private

**3. Content Grid**
- Desktop: 3-column grid for media
- Mobile: Single column for all content

### 8.3 Post Detail Page

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Header (with Back button)                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚  â”‚   Post Card (Expanded)          â”‚            â”‚
â”‚  â”‚                                 â”‚            â”‚
â”‚  â”‚   Author info                   â”‚            â”‚
â”‚  â”‚   Post content (full)           â”‚            â”‚
â”‚  â”‚   Media (large display)         â”‚            â”‚
â”‚  â”‚   Timestamp (detailed)          â”‚            â”‚
â”‚  â”‚   Engagement metrics            â”‚            â”‚
â”‚  â”‚   Action buttons                â”‚            â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚  â”‚   Comment Input                 â”‚            â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚  â”‚   Comments Thread               â”‚            â”‚
â”‚  â”‚                                 â”‚            â”‚
â”‚  â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”‚            â”‚
â”‚  â”‚   â”‚ Comment 1       â”‚           â”‚            â”‚
â”‚  â”‚   â”‚  â”œâ”€ Reply 1.1   â”‚           â”‚            â”‚
â”‚  â”‚   â”‚  â””â”€ Reply 1.2   â”‚           â”‚            â”‚
â”‚  â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â”‚            â”‚
â”‚  â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”‚            â”‚
â”‚  â”‚   â”‚ Comment 2       â”‚           â”‚            â”‚
â”‚  â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â”‚            â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 8.4 Messages Page

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Header (Navigation)                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Conversation â”‚  â”‚   Active Conversation  â”‚  â”‚
â”‚  â”‚    List      â”‚  â”‚                        â”‚  â”‚
â”‚  â”‚              â”‚  â”‚  Header: User Info     â”‚  â”‚
â”‚  â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚  â”‚
â”‚  â”‚ â”‚ Conv 1   â”‚ â”‚  â”‚  â”‚  Message Bubble  â”‚ â”‚  â”‚
â”‚  â”‚ â”‚ Active   â”‚ â”‚  â”‚  â”‚  (Sent)          â”‚ â”‚  â”‚
â”‚  â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚  â”‚
â”‚  â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚  â”‚
â”‚  â”‚ â”‚ Conv 2   â”‚ â”‚  â”‚  â”‚  Message Bubble  â”‚ â”‚  â”‚
â”‚  â”‚ â”‚ Unread:2 â”‚ â”‚  â”‚  â”‚  (Received)      â”‚ â”‚  â”‚
â”‚  â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚  â”‚
â”‚  â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚  â”‚         ...          â”‚  â”‚
â”‚  â”‚ â”‚ Conv 3   â”‚ â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚  â”‚
â”‚  â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚  â”‚  â”‚  Input Field     â”‚ â”‚  â”‚
â”‚  â”‚     ...      â”‚  â”‚  â”‚  [Send] [Media]  â”‚ â”‚  â”‚
â”‚  â”‚              â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚     320px              Flexible width          â”‚
â”‚                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Mobile:**
- Full screen conversation list
- Tapping conversation shows full-screen chat
- Back button returns to list

### 8.5 Explore/Search Page

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Header (with Search Bar)                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚  â”‚  Tabs: Posts | Users | Tags     â”‚            â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚  â”‚  Trending Topics                â”‚            â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚            â”‚
â”‚  â”‚  â”‚ #Technology  Â· 15.2K postsâ”‚  â”‚            â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚            â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚            â”‚
â”‚  â”‚  â”‚ #Sports      Â· 8.5K posts â”‚  â”‚            â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚            â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚  â”‚  For You (Recommended)          â”‚            â”‚
â”‚  â”‚                                 â”‚            â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚            â”‚
â”‚  â”‚  â”‚ Post Card â”‚  â”‚ Post Card â”‚  â”‚            â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚            â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 8.6 Settings Page

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Header (Navigation)                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  Side Menu   â”‚  â”‚   Settings Content     â”‚  â”‚
â”‚  â”‚              â”‚  â”‚                        â”‚  â”‚
â”‚  â”‚  Account     â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚
â”‚  â”‚  Privacy â†   â”‚  â”‚  â”‚  Privacy Settingsâ”‚  â”‚  â”‚
â”‚  â”‚  Security    â”‚  â”‚  â”‚                  â”‚  â”‚  â”‚
â”‚  â”‚  Notificationsâ”‚ â”‚  â”‚  Profile Visible â”‚  â”‚  â”‚
â”‚  â”‚  Display     â”‚  â”‚  â”‚  [ ] Public      â”‚  â”‚  â”‚
â”‚  â”‚  About       â”‚  â”‚  â”‚  [x] Private     â”‚  â”‚  â”‚
â”‚  â”‚              â”‚  â”‚  â”‚                  â”‚  â”‚  â”‚
â”‚  â”‚              â”‚  â”‚  â”‚  Posts Visible   â”‚  â”‚  â”‚
â”‚  â”‚              â”‚  â”‚  â”‚  [x] Everyone    â”‚  â”‚  â”‚
â”‚  â”‚              â”‚  â”‚  â”‚  [ ] Followers   â”‚  â”‚  â”‚
â”‚  â”‚              â”‚  â”‚  â”‚                  â”‚  â”‚  â”‚
â”‚  â”‚              â”‚  â”‚  â”‚  [Save Changes]  â”‚  â”‚  â”‚
â”‚  â”‚              â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚     240px              Flexible width          â”‚
â”‚                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 9. User Flows

### 9.1 Registration Flow

```
[Landing Page]
      â†“
   [Click "Sign Up"]
      â†“
[Registration Form]
  - Email
  - Username
  - Password
      â†“
  [Submit Form]
      â†“
   [Validation]
      â”œâ”€ Invalid â†’ Show Errors â†’ Return to Form
      â””â”€ Valid
          â†“
    [Send Verification Email]
          â†“
    [Email Sent Confirmation Page]
          â†“
    [User Checks Email]
          â†“
    [Click Verification Link]
          â†“
    [Email Verified Success]
          â†“
    [Redirect to Login]
          â†“
    [Login]
          â†“
    [Welcome Onboarding]
  - Complete profile
  - Upload avatar
  - Find friends
      â†“
    [Home Feed]
```

### 9.2 Post Creation Flow

```
[Home Feed]
      â†“
[Click "Create Post" or Input Field]
      â†“
[Post Composer Opens]
  - Text input active
  - 5000 char limit shown
      â†“
[User Types Content]
      â†“
[Optional: Add Media]
  â”œâ”€ Click Media Icon
  â”œâ”€ Select Files
  â”œâ”€ Upload Progress
  â””â”€ Preview Shown
      â†“
[Optional: Add Privacy Setting]
  â”œâ”€ Click Privacy Dropdown
  â””â”€ Select: Public/Followers/Private
      â†“
[Click "Post" Button]
      â†“
[Validation]
  â”œâ”€ Empty â†’ Disable button
  â”œâ”€ Too long â†’ Show error
  â””â”€ Valid â†’ Continue
      â†“
[Optimistic UI]
  - Show post immediately in feed
  - Show "Posting..." indicator
      â†“
[API Call]
  â”œâ”€ Success â†’ Remove indicator, finalize
  â””â”€ Error â†’ Show error, offer retry
      â†“
[Post Published]
  - Appears in followers' feeds
  - Notifications sent
```

### 9.3 Message Send Flow

```
[Messages Page]
      â†“
[Select Conversation]
  OR
[Click "New Message"]
      â†“
[If New Message]
  â”œâ”€ Search for User
  â”œâ”€ Select Recipient
  â””â”€ Create Conversation
      â†“
[Conversation View Opens]
      â†“
[Type Message]
      â†“
[Optional: Add Media]
  â”œâ”€ Click Media Icon
  â”œâ”€ Select Image/Video
  â””â”€ Preview Shown
      â†“
[Press Enter or Click Send]
      â†“
[Optimistic UI]
  - Message appears immediately
  - "Sending..." indicator
      â†“
[WebSocket Send]
  â”œâ”€ Success
  â”‚   â”œâ”€ Show "Delivered" checkmark
  â”‚   â””â”€ Recipient sees in real-time
  â””â”€ Error
      â””â”€ Show error, offer retry
      â†“
[Message Sent Successfully]
  - Delivered checkmark
  - Read receipt (if enabled)
```

### 9.4 Follow User Flow

```
[Discover User]
  - Via Search
  - Via Suggestions
  - Via Post
      â†“
[View User Profile]
      â†“
[Click "Follow" Button]
      â†“
[Check Profile Privacy]
  â”œâ”€ Public Profile
  â”‚   â”œâ”€ Immediate Follow
  â”‚   â”œâ”€ Button â†’ "Following"
  â”‚   â”œâ”€ Follower count +1
  â”‚   â””â”€ User gets notification
  â”‚       â†“
  â”‚   [Start Seeing Posts in Feed]
  â”‚
  â””â”€ Private Profile
      â”œâ”€ Send Follow Request
      â”œâ”€ Button â†’ "Requested"
      â””â”€ User gets notification
          â†“
      [User Reviews Request]
          â”œâ”€ Accept
          â”‚   â”œâ”€ Follow established
          â”‚   â”œâ”€ Requester notified
          â”‚   â””â”€ Requester sees posts
          â”‚
          â””â”€ Decline
              â”œâ”€ Request removed
              â””â”€ Requester not notified
```

### 9.5 Search Flow

```
[Click Search Bar]
      â†“
[Enter Search Query]
      â†“
[Real-time Search Results]
  - Autocomplete suggestions
  - Recent searches
      â†“
[Press Enter or Select Suggestion]
      â†“
[Search Results Page]
  â”Œâ”€ Tabs:
  â”‚  - Posts
  â”‚  - Users
  â”‚  - Hashtags
  â”‚
  â”œâ”€ Filters:
  â”‚  - Date range
  â”‚  - Content type
  â”‚  - From: Everyone/Following
  â”‚
  â””â”€ Results List
      â”œâ”€ Highlighted keywords
      â””â”€ Pagination
      â†“
[Click Result]
      â”œâ”€ User â†’ Profile Page
      â”œâ”€ Post â†’ Post Detail Page
      â””â”€ Hashtag â†’ Hashtag Page
```

---

## 10. Responsive Design

### 10.1 Breakpoints

```
mobile:     320px - 767px   (xs, sm)
tablet:     768px - 1023px  (md)
desktop:    1024px - 1439px (lg, xl)
large:      1440px+         (2xl)
```

### 10.2 Mobile Adaptations

**Navigation:**
- Desktop: Horizontal nav bar + sidebar
- Mobile: Bottom tab bar (Home, Search, Notifications, Profile)
- Burger menu for additional options

**Feed:**
- Desktop: Max-width 600px, centered
- Mobile: Full-width, no margins

**Cards:**
- Desktop: Rounded corners, shadow
- Mobile: Flat (no rounded corners on sides), border-top only

**Modals:**
- Desktop: Centered overlay, max-width 600px
- Mobile: Full-screen slide-up

**Forms:**
- Desktop: 2-column layout
- Mobile: Single column, full-width inputs

**Images:**
- Desktop: Max-width within container
- Mobile: Full-width, maintain aspect ratio

### 10.3 Touch Targets

**Minimum Touch Target: 44px Ã— 44px**

All interactive elements on mobile:
- Buttons: minimum 44px height
- Links: minimum 44px touch area
- Icons: 24px icon in 44px touch area
- Spacing: 8px minimum between targets

### 10.4 Typography Scaling

**Base Font Size:**
- Desktop: 16px
- Mobile: 16px (don't scale down)

**Headings:**
- Scale down 10-20% on mobile
- Maintain readability
- Line-height: 1.2-1.4

**Body Text:**
- Desktop: 16px / 24px line-height
- Mobile: 16px / 24px (same)

### 10.5 Mobile-First Approach

**CSS Strategy:**
```css
/* Mobile-first base styles */
.element {
  font-size: 16px;
  padding: 12px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .element {
    font-size: 18px;
    padding: 16px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .element {
    font-size: 20px;
    padding: 20px;
  }
}
```

---

## 11. Accessibility Guidelines

### 11.1 WCAG 2.1 Level AA Compliance

**Perceivable:**
- Text contrast: minimum 4.5:1
- Large text: minimum 3:1
- UI components: minimum 3:1
- Images: alt text required
- Videos: captions required

**Operable:**
- Keyboard navigation
- Focus indicators (visible)
- No keyboard traps
- Sufficient time for interactions
- Skip links (skip to main content)

**Understandable:**
- Clear language (8th-grade level)
- Consistent navigation
- Clear error messages
- Help text available

**Robust:**
- Valid HTML
- ARIA landmarks
- Semantic HTML
- Screen reader compatible

### 11.2 Keyboard Navigation

**Tab Order:**
- Logical reading order
- Skip repetitive elements
- Focus visible (2px outline, primary-500)

**Keyboard Shortcuts:**
```
/         - Focus search
n         - New post
m         - Messages
?         - Show keyboard shortcuts
Esc       - Close modal/dropdown
Arrow keys - Navigate lists
Enter     - Activate button/link
Space     - Toggle checkbox/switch
```

### 11.3 Screen Reader Support

**ARIA Labels:**
```html
<!-- Button with icon only -->
<button aria-label="Close modal">
  <CloseIcon />
</button>

<!-- Nav landmark -->
<nav aria-label="Main navigation">

<!-- Live region for updates -->
<div aria-live="polite" aria-atomic="true">
  Post created successfully
</div>

<!-- Expandable section -->
<button aria-expanded="false" aria-controls="panel">
  Show more
</button>
<div id="panel" aria-hidden="true">
  Additional content
</div>
```

**Semantic HTML:**
- Use `<nav>` for navigation
- Use `<main>` for main content
- Use `<article>` for posts
- Use `<button>` for buttons (not `<div>`)
- Use `<a>` for links

### 11.4 Focus Management

**Focus Trapping (Modals):**
```javascript
// When modal opens:
// 1. Save current focus
// 2. Move focus to modal
// 3. Trap focus within modal
// 4. On close, restore previous focus
```

**Focus Indicators:**
```css
:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Don't remove focus styles! */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 11.5 Color Accessibility

**Color Blindness:**
- Don't rely on color alone
- Use icons + labels
- Use patterns/textures

**High Contrast Mode:**
- Test in Windows High Contrast Mode
- Provide high contrast theme option

**Colorblind-Friendly Palette:**
- Red-Green: Use blue as accent
- Blue-Yellow: Use magenta/orange

---

## 12. Animation & Interactions

### 12.1 Animation Principles

**Easing Functions:**
```
ease-out:    Deceleration (hover, appearing)
ease-in:     Acceleration (disappearing)
ease-in-out: Both (movement)
linear:      Continuous (loaders)
```

**Duration:**
```
instant:  0ms
fast:     100ms  (micro-interactions)
normal:   200ms  (default)
slow:     300ms  (page transitions)
slower:   500ms  (complex animations)
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 12.2 Micro-interactions

**Button Hover:**
```css
.button {
  transition: all 200ms ease-out;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.button:active {
  transform: translateY(0);
}
```

**Like Button (Heart):**
```css
/* Scale + color change */
.like-button.liked {
  animation: heartbeat 300ms ease-out;
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
```

**Input Focus:**
```css
input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-100);
  transition: all 200ms ease-out;
}
```

### 12.3 Page Transitions

**Route Changes:**
```
Fade in new page: 200ms
Slide in from right: 300ms (mobile)
Crossfade: 200ms (desktop)
```

**Modal Animations:**
```css
/* Backdrop fade in */
.modal-backdrop {
  animation: fadeIn 200ms ease-out;
}

/* Modal scale + fade */
.modal {
  animation: scaleIn 200ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### 12.4 Loading States

**Skeleton Screens:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--neutral-200) 0%,
    var(--neutral-300) 50%,
    var(--neutral-200) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Spinners:**
```css
.spinner {
  border: 3px solid var(--neutral-200);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 12.5 Scroll Animations

**Lazy Loading:**
- Fade in as elements enter viewport
- Threshold: 0.1 (10% visible)

**Infinite Scroll:**
- Load next page 200px before bottom
- Show loading indicator
- Smooth addition of items

**Pull to Refresh:**
```
1. User pulls down > 80px
2. Show loading spinner
3. Trigger refresh
4. Animate back to top
```

---

## 13. Icon Library

### 13.1 Icon System

**Icon Set: Lucide Icons** (or Heroicons)
- Consistent 2px stroke width
- 24px Ã— 24px default size
- Outlined style (primary)
- Filled style (for active states)

**Icon Sizes:**
```
xs:  16px
sm:  20px
md:  24px  â† Default
lg:  32px
xl:  40px
```

### 13.2 Common Icons

**Navigation:**
- Home (house)
- Search (magnifying glass)
- Notifications (bell)
- Messages (envelope)
- Profile (user circle)
- Settings (gear/cog)
- Menu (three horizontal lines)

**Actions:**
- Like (heart)
- Comment (speech bubble)
- Share (arrow up from box)
- Bookmark (bookmark outline)
- More (three dots vertical)
- Close (X)
- Back (arrow left)
- Forward (arrow right)
- Add (plus)
- Remove (minus)

**Content:**
- Image (picture icon)
- Video (play button)
- GIF (GIF text)
- Emoji (smiley face)
- Attach (paperclip)
- Location (map pin)
- Link (chain)

**Status:**
- Verified (checkmark in circle)
- Private (lock)
- Public (globe)
- Followers (users)
- Trending (flame or arrow up)

**Social:**
- Follow (user plus)
- Unfollow (user minus)
- Block (slash circle)
- Mute (bell slash)

### 13.3 Icon Usage

**With Text:**
```
Icon: 20px
Text: 16px
Gap: 8px
Vertical alignment: center
```

**Icon-only Buttons:**
```
Button size: 40px Ã— 40px
Icon size: 20px
Center aligned
Tooltip on hover
```

**Icon Colors:**
```
Default: neutral-600
Hover: neutral-900
Active: primary-500
Disabled: neutral-400
```

---

## 14. Design Patterns

### 14.1 Empty States

**Structure:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    â”‚
â”‚      Icon          â”‚ 64px, neutral-400
â”‚                    â”‚
â”‚   Primary Text     â”‚ heading-5, bold
â”‚   Secondary Text   â”‚ body, neutral-600
â”‚                    â”‚
â”‚   [Action Button]  â”‚
â”‚                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Examples:**

**No Posts Yet:**
- Icon: Document icon
- Title: "No posts yet"
- Description: "When you or people you follow post, they'll appear here."
- Action: "Find people to follow"

**No Notifications:**
- Icon: Bell icon
- Title: "No notifications"
- Description: "When you get notifications, they'll show up here."

**No Messages:**
- Icon: Envelope icon
- Title: "No messages"
- Description: "Start a conversation by sending a message."
- Action: "Send a message"

### 14.2 Error States

**Structure:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    â”‚
â”‚   âš ï¸ Error Icon    â”‚ error-500
â”‚                    â”‚
â”‚   Error Title      â”‚ heading-5
â”‚   Error Message    â”‚ body, neutral-600
â”‚   Error Code       â”‚ caption, neutral-500
â”‚                    â”‚
â”‚   [Retry Button]   â”‚
â”‚   [Go Back]        â”‚
â”‚                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Error Messages:**
- **Network Error:** "Connection lost. Check your internet and try again."
- **404:** "Page not found. The page you're looking for doesn't exist."
- **500:** "Something went wrong. We're working to fix it."
- **Permission:** "You don't have permission to view this content."

### 14.3 Loading States

**Types:**

**1. Full Page Loading:**
```
Centered spinner
Logo above (optional)
"Loading..." text below
Background: neutral-50
```

**2. Skeleton Screen:**
```
Show layout structure
Animated shimmer effect
Replace with real content when loaded
```

**3. Inline Loading:**
```
Spinner next to action
"Loading..." text
Disable button during load
```

**4. Progress Bar:**
```
Linear progress for uploads
Percentage shown
Cancel button available
```

### 14.4 Confirmation Dialogs

**Structure:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  âš ï¸ Warning Icon        â”‚
â”‚                         â”‚
â”‚  Confirmation Title     â”‚
â”‚  Description text       â”‚
â”‚  Consequences explained â”‚
â”‚                         â”‚
â”‚  [Cancel]  [Confirm]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Examples:**

**Delete Post:**
- Title: "Delete post?"
- Description: "This can't be undone and it will be removed from your profile and the feed."
- Buttons: "Cancel" (secondary), "Delete" (destructive)

**Unfollow User:**
- Title: "Unfollow @username?"
- Description: "Their posts will no longer show in your home feed."
- Buttons: "Cancel", "Unfollow"

**Logout:**
- Title: "Logout?"
- Description: "You can always log back in anytime."
- Buttons: "Cancel", "Logout"

### 14.5 Form Validation

**Inline Validation:**
- Validate on blur (when user leaves field)
- Show success checkmark for valid
- Show error message for invalid
- Real-time validation for username availability

**Error Display:**
```
Input: red border
Icon: error icon (left or right of input)
Message: Below input, red text, 14px
```

**Success Display:**
```
Input: green border (optional, subtle)
Icon: checkmark (right of input)
Message: "Looks good!" (optional)
```

**Required Fields:**
- Asterisk (*) after label
- Clear "Required" indication
- Prevent submission if empty

---

## 15. Mobile App Design

### 15.1 Bottom Navigation (iOS/Android)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                 â”‚
â”‚         Content Area            â”‚
â”‚                                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  [Home] [Search] [+] [â¤] [ðŸ‘¤] â”‚ â† 60px height
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Tabs:**
1. Home (feed icon)
2. Search (magnifying glass)
3. Create (plus icon, larger, elevated)
4. Notifications (heart/bell)
5. Profile (avatar)

**States:**
- Active: primary-500, icon filled
- Inactive: neutral-600, icon outlined

### 15.2 Gestures

**Supported Gestures:**
- **Swipe Left:** Go back (navigation)
- **Swipe Right:** Open menu/previous page
- **Pull Down:** Refresh
- **Double Tap:** Like (on post image)
- **Long Press:** Context menu
- **Pinch:** Zoom (on images)

### 15.3 Native Patterns

**iOS:**
- Large titles (navigation)
- Haptic feedback
- Swipe back gesture
- Bottom sheets (action sheets)

**Android:**
- Material Design components
- Floating Action Button (FAB)
- Navigation drawer
- Bottom sheets

### 15.4 Status Bar

```
Light content: White icons (dark backgrounds)
Dark content: Black icons (light backgrounds)
Height: 44px (iOS), 24px (Android)
```

### 15.5 Safe Areas

**iOS:**
```
Top safe area: 44px (notch) + 44px (status bar)
Bottom safe area: 34px (home indicator)
Side safe areas: 20px
```

**Design for edge-to-edge:**
- Content respects safe areas
- Backgrounds can extend to edges
- Critical UI avoids unsafe areas

---

## 16. Design Deliverables

### 16.1 Figma Files

**Structure:**
```
ðŸ“ ConnectHub Design System
  â”œâ”€ ðŸ“„ Cover Page
  â”œâ”€ ðŸ“„ Design Tokens
  â”œâ”€ ðŸ“„ Color Palette
  â”œâ”€ ðŸ“„ Typography
  â”œâ”€ ðŸ“„ Components
  â”œâ”€ ðŸ“„ Icons
  â”œâ”€ ðŸ“„ Patterns
  â””â”€ ðŸ“„ Templates

ðŸ“ ConnectHub Screens
  â”œâ”€ ðŸ“„ Authentication
  â”œâ”€ ðŸ“„ Home & Feed
  â”œâ”€ ðŸ“„ Profile
  â”œâ”€ ðŸ“„ Messages
  â”œâ”€ ðŸ“„ Notifications
  â”œâ”€ ðŸ“„ Search & Explore
  â”œâ”€ ðŸ“„ Settings
  â””â”€ ðŸ“„ Modals & Overlays

ðŸ“ ConnectHub Prototypes
  â”œâ”€ ðŸ“„ User Flows
  â”œâ”€ ðŸ“„ Desktop Prototype
  â”œâ”€ ðŸ“„ Mobile Prototype
  â””â”€ ðŸ“„ Interactions
```

### 16.2 Component Library

**Figma Components:**
- Auto-layout enabled
- Variants for all states
- Props for customization
- Detach instances when needed

**Component States:**
- Default
- Hover
- Active
- Focus
- Disabled
- Loading
- Error

### 16.3 Design Handoff

**For Developers:**

**Specs:**
- Spacing values (px/rem)
- Font sizes and weights
- Color codes (hex/rgba)
- Border radius values
- Shadow values

**Assets:**
- SVG icons
- Image assets (multiple resolutions)
- Logo files (SVG, PNG)
- Favicons

**Documentation:**
- Component usage guidelines
- Interaction descriptions
- Animation specs
- Responsive behavior

**Tools:**
- Figma Dev Mode
- Zeplin (alternative)
- Storybook for components

---

## 17. Brand Guidelines

### 17.1 Logo

**Primary Logo:**
```
ConnectHub
  - Wordmark
  - Custom typeface
  - Primary: #2196F3 (blue)
  - Always on white or neutral-900
```

**Logo Variations:**
- Full logo (text + icon)
- Icon only (app icon, favicon)
- Monochrome (white, black)

**Clear Space:**
- Minimum: Logo height Ã— 0.5 on all sides

**Minimum Size:**
- Digital: 120px width
- Print: 1 inch width

**Don'ts:**
- Don't stretch or distort
- Don't change colors
- Don't add effects (shadows, gradients)
- Don't place on busy backgrounds

### 17.2 App Icon

**Sizes:**
```
iOS:
  - 1024Ã—1024 (App Store)
  - 180Ã—180 (iPhone)
  - 167Ã—167 (iPad Pro)
  - 152Ã—152 (iPad)
  - 120Ã—120 (iPhone)

Android:
  - 512Ã—512 (Play Store)
  - xxxhdpi: 192Ã—192
  - xxhdpi: 144Ã—144
  - xhdpi: 96Ã—96
  - hdpi: 72Ã—72

Web:
  - favicon.ico: 32Ã—32, 16Ã—16
  - apple-touch-icon: 180Ã—180
  - android-chrome: 192Ã—192, 512Ã—512
```

**Design:**
- Simple, recognizable shape
- Works at small sizes
- No text (icon only)
- Consistent with brand colors

### 17.3 Voice & Tone

**Brand Voice:**
- Friendly but professional
- Clear and concise
- Helpful and encouraging
- Inclusive and respectful

**Writing Style:**
- Active voice preferred
- Short sentences
- Plain language (avoid jargon)
- Conversational but not overly casual

**Error Messages:**
- What went wrong
- Why it happened
- How to fix it
- Avoid blame

**Examples:**
```
âŒ Bad: "Error 500. Server failed."
âœ… Good: "Something went wrong on our end. We're working to fix it. Please try again in a moment."

âŒ Bad: "Invalid input."
âœ… Good: "Username must be 3-30 characters and contain only letters, numbers, and underscores."

âŒ Bad: "You can't do that."
âœ… Good: "To send messages, you need to follow this user first."
```

---

## 18. Appendix

### 18.1 Design Tools

**Design:**
- Figma (primary design tool)
- Adobe Illustrator (vector graphics)
- Adobe Photoshop (image editing)

**Prototyping:**
- Figma (interactive prototypes)
- Principle (micro-interactions)

**Collaboration:**
- Figma (shared files)
- Slack (communication)
- Notion (documentation)

**Testing:**
- Maze (user testing)
- Hotjar (heatmaps, recordings)
- Google Analytics (behavior)

**Accessibility:**
- Stark (contrast checker)
- WAVE (accessibility evaluation)
- axe DevTools (automated testing)

### 18.2 Design Resources

**Inspiration:**
- Dribbble
- Behance
- Awwwards
- UI Movement

**Components:**
- shadcn/ui
- Radix UI
- Headless UI
- Material UI

**Icons:**
- Lucide Icons
- Heroicons
- Feather Icons
- Font Awesome

**Illustrations:**
- unDraw
- Humaaans
- Absurd Design

**Fonts:**
- Google Fonts
- Adobe Fonts
- Font Squirrel

### 18.3 Performance Budget

**Image Optimization:**
- Use WebP format
- Lazy load images
- Responsive images (srcset)
- Max file size: 200KB per image

**Font Loading:**
- Subset fonts (only needed characters)
- Preload critical fonts
- Font-display: swap

**CSS:**
- Critical CSS inlined
- Non-critical CSS async
- Minified and compressed

**JavaScript:**
- Code splitting
- Lazy load components
- Tree shaking
- Minified and compressed

**Performance Metrics:**
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- Cumulative Layout Shift: < 0.1

### 18.4 Browser Support

**Desktop:**
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

**Mobile:**
- iOS Safari 14+
- Chrome for Android (last 2 versions)
- Samsung Internet (last 2 versions)

**Progressive Enhancement:**
- Core functionality works without JS
- Enhanced with JS
- Graceful degradation for older browsers

### 18.5 Testing Checklist

**Visual QA:**
- [ ] All breakpoints tested
- [ ] Dark mode tested
- [ ] High contrast mode tested
- [ ] Colors match design system
- [ ] Typography consistent
- [ ] Spacing accurate
- [ ] Alignment correct
- [ ] Images optimized

**Interaction QA:**
- [ ] All buttons clickable
- [ ] Hover states working
- [ ] Focus states visible
- [ ] Animations smooth (60fps)
- [ ] Loading states shown
- [ ] Error states handled
- [ ] Success feedback given

**Accessibility QA:**
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] ARIA labels present
- [ ] Alt text on images
- [ ] Form labels associated
- [ ] Focus order logical
- [ ] No keyboard traps

**Content QA:**
- [ ] Copy proofread
- [ ] Tone consistent
- [ ] Links working
- [ ] Images have alt text
- [ ] Empty states designed
- [ ] Error messages helpful

**Performance QA:**
- [ ] Page load < 3s
- [ ] Images lazy loaded
- [ ] Fonts loaded efficiently
- [ ] No layout shifts
- [ ] Smooth scrolling
- [ ] Fast interactions

---

## 19. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Feb 12, 2026 | Initial complete design specifications | Design Team |

---

## 20. Approval & Sign-off

**Design Lead:** _____________________ Date: _________

**Product Manager:** __________________ Date: _________

**Engineering Lead:** _________________ Date: _________

**Accessibility Lead:** _______________ Date: _________

---

**END OF DOCUMENT**

**Status:** âœ… COMPLETE  
**Pages:** 70+  
**Components Documented:** 50+  
**Design System:** Fully Defined  
**Ready for:** Development Implementation



