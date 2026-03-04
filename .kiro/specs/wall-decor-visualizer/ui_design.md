# Wall Decor Visualizer - UI Design Guide

## Design Inspiration: UrbanCompany

UrbanCompany's design philosophy emphasizes:
- Clean, professional interface
- Trust and reliability through minimalist design
- Easy service discovery and booking
- Clear call-to-action buttons
- Responsive mobile-first approach
- Service category cards with icons
- User-friendly navigation

---

## Design System

### Color Palette (Vibrant Pastels - Green, Pink, Blue, Yellow)
- **Primary Green**: `#86efac` (Soft Mint Green) - Primary accent, interactive elements
- **Primary Pink**: `#f472b6` (Soft Rose Pink) - Secondary accent, highlights
- **Primary Blue**: `#60a5fa` (Soft Sky Blue) - Tertiary accent, information
- **Primary Yellow**: `#fbbf24` (Soft Amber Yellow) - Accent, CTAs, highlights
- **Background**: `#fafaf9` (Warm Off-white) - Clean, minimal
- **Surface Light**: `#f0fdf4` (Ultra-light Green) - Subtle backgrounds
- **Surface Dark**: `#fce7f3` (Ultra-light Pink) - Cards, sections
- **Text Primary**: `#2d3748` (Soft Charcoal) - Main text
- **Text Secondary**: `#78716c` (Warm Gray) - Secondary text
- **Text Tertiary**: `#a8a29e` (Light Warm Gray) - Disabled, hints
- **Border**: `#e7e5e4` (Warm Light Gray) - Dividers, borders
- **Error**: `#f87171` (Soft Red) - Errors, warnings
- **Success**: `#86efac` (Soft Mint Green) - Success states
- **Info**: `#60a5fa` (Soft Sky Blue) - Information

### Typography
- **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen'`
- **Heading 1 (H1)**: 2.5rem (40px), Bold (700), Line-height 1.2, Letter-spacing -0.02em
- **Heading 2 (H2)**: 2rem (32px), Bold (700), Line-height 1.3, Letter-spacing -0.01em
- **Heading 3 (H3)**: 1.5rem (24px), Semi-bold (600), Line-height 1.4
- **Heading 4 (H4)**: 1.25rem (20px), Semi-bold (600), Line-height 1.4
- **Body Large**: 1.125rem (18px), Regular (400), Line-height 1.6
- **Body**: 1rem (16px), Regular (400), Line-height 1.6
- **Body Small**: 0.875rem (14px), Regular (400), Line-height 1.5
- **Caption**: 0.75rem (12px), Regular (400), Line-height 1.4
- **Label**: 0.875rem (14px), Semi-bold (600), Line-height 1.5

### Spacing Scale
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

### Border Radius
- **sm**: 0.375rem (6px)
- **md**: 0.5rem (8px)
- **lg**: 0.75rem (12px)
- **xl**: 1rem (16px)
- **2xl**: 1.5rem (24px)
- **full**: 9999px

### Shadows
- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
- **2xl**: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`

---

## Login Page Design

### Layout
- Full-screen gradient background with floating elements
- Centered card with form
- Two-step authentication flow: Phone Number → OTP Verification
- Responsive: Mobile-first design

### Components

**Card Container:**
- Width: 100% on mobile, 420px on desktop
- Background: Warm Off-white (#fafaf9)
- Border Radius: lg (16px)
- Shadow: lg
- Padding: 2.5rem (40px) on desktop, 1.5rem (24px) on mobile
- Border: 1px solid #ede9fe

**Header Section:**
- Logo/Brand name: "Wall Decor Visualizer"
- Subtitle: "Sign in to your account"
- Centered alignment
- Margin bottom: 2.5rem
- Logo size: 40px x 40px

**Step 1: Phone Number Input**
- Phone number input field
- Label: "Phone Number"
- Placeholder: "Enter your 10-digit phone number"
- Input height: 2.75rem (44px)
- Input padding: 0.75rem 1rem
- Input border: 1.5px solid #e7e5e4
- Input border-radius: md (10px)
- Focus state: Border color #a78bfa, soft glow shadow
- Button: "Send OTP" (full width, gradient background)

**Step 2: OTP Verification**
- OTP info text: "We've sent a 4-digit code to [phone number]"
- OTP input field (4 digits only)
- Label: "Enter OTP"
- Placeholder: "Enter 4-digit OTP"
- Input height: 2.75rem (44px)
- Input padding: 0.75rem 1rem
- Input border: 1.5px solid #e7e5e4
- Input border-radius: md (10px)
- Focus state: Border color #a78bfa, soft glow shadow
- Button: "Verify OTP" (full width, gradient background)
- Back Button: "Back to Phone Number" (secondary style)

### States
- **Default**: Normal appearance
- **Hover**: Button background changes, slight shadow increase
- **Focus**: Input has soft glow effect (3px rgba(167, 139, 250, 0.1))
- **Error**: Red border on input, error message below in red (#c5192d)
- **Loading**: Button shows loading text, disabled state
- **Disabled**: Opacity 0.6, cursor not-allowed

### Validation Messages
- Error color: #c5192d (Soft Red)
- Font size: 0.75rem
- Margin top: 0.25rem
- Animation: Fade-in with smooth entrance

---

## Upload Page Design

### Layout
- Header with navigation bar
- Hero section with title and description
- Main upload area (full width on mobile, centered on desktop)
- Recent uploads section below
- Responsive: Mobile-first design

### Header/Navigation
- Background: White
- Border-bottom: 1px solid #e5e7eb
- Height: 4rem (64px)
- Padding: 0 1.5rem
- Display: Flex, space-between
- Logo on left
- User profile dropdown on right
- Shadow: sm

**Logo:**
- Size: 32px x 32px
- Font size: 1.25rem
- Font weight: Bold (700)
- Color: #1f2937

**User Profile Dropdown:**
- Avatar: 40px x 40px, border-radius: full
- Dropdown menu on click
- Options: Profile, Settings, Logout

### Hero Section
- Background: Linear gradient from #f9fafb to #ffffff
- Padding: 3rem 1.5rem
- Text-align: center
- Margin-bottom: 2rem

**Title:**
- Font size: 2rem (32px)
- Font weight: Bold (700)
- Color: #1f2937
- Margin-bottom: 0.5rem

**Subtitle:**
- Font size: 1rem (16px)
- Color: #6b7280
- Margin-bottom: 0

### Upload Area
- Background: #f9fafb
- Border: 2px dashed #667eea
- Border-radius: lg (12px)
- Padding: 3rem
- Text-align: center
- Cursor: pointer
- Transition: all 0.3s ease-in-out

**Upload Area Hover State:**
- Background: #f3f4f6
- Border-color: #764ba2
- Box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.2)

**Upload Area Drag State:**
- Background: #ede9fe
- Border-color: #764ba2
- Box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.3)

**Upload Icon:**
- Size: 3rem x 3rem
- Color: #667eea
- Margin-bottom: 1rem

**Upload Text:**
- Title: "Drag and drop your image here"
- Font size: 1.125rem (18px)
- Font weight: Semi-bold (600)
- Color: #1f2937
- Margin-bottom: 0.5rem

**Upload Subtitle:**
- Text: "or click to select from your computer"
- Font size: 0.875rem (14px)
- Color: #6b7280
- Margin-bottom: 1rem

**Supported Formats:**
- Font size: 0.75rem (12px)
- Color: #9ca3af
- Text: "Supported formats: JPG, PNG, WebP"

**Max Size:**
- Font size: 0.75rem (12px)
- Color: #9ca3af
- Text: "Max size: 10MB"

### Camera Capture Button
- Below upload area
- Full width
- Background: #f3f4f6
- Border: 1px solid #e5e7eb
- Hover: Background #e5e7eb
- Padding: 0.75rem 1rem
- Height: 2.75rem (44px)
- Border-radius: md (8px)
- Font weight: Semi-bold (600)
- Margin-top: 1rem
- Icon + Text: "📷 Capture from Camera"

### Recent Uploads Section
- Margin-top: 3rem
- Padding-top: 2rem
- Border-top: 1px solid #e5e7eb

**Section Title:**
- Font size: 1.25rem (20px)
- Font weight: Semi-bold (600)
- Color: #1f2937
- Margin-bottom: 1.5rem

**Image Grid:**
- Grid layout: 1 column on mobile, 2 on tablet, 3 on desktop
- Gap: 1rem
- Image cards with:
  - Thumbnail (aspect-ratio: 1/1)
  - File name (truncated)
  - Upload date
  - Delete button (hover)

**Image Card:**
- Background: White
- Border: 1px solid #e5e7eb
- Border-radius: md (8px)
- Overflow: hidden
- Transition: all 0.3s ease-in-out

**Image Card Hover:**
- Box-shadow: lg
- Transform: translateY(-2px)

**Image Thumbnail:**
- Width: 100%
- Height: 150px
- Object-fit: cover
- Background: #f3f4f6

**Image Info:**
- Padding: 1rem
- Background: White

**Image Name:**
- Font size: 0.875rem (14px)
- Font weight: Semi-bold (600)
- Color: #1f2937
- Truncate: text-overflow ellipsis
- Margin-bottom: 0.25rem

**Upload Date:**
- Font size: 0.75rem (12px)
- Color: #9ca3af

**Delete Button:**
- Position: Absolute top-right
- Background: #ef4444
- Color: White
- Size: 32px x 32px
- Border-radius: full
- Icon: Trash
- Opacity: 0 on default, 1 on hover
- Transition: opacity 0.2s

### Upload Progress
- Position: Fixed bottom-right
- Background: White
- Border: 1px solid #e5e7eb
- Border-radius: lg (12px)
- Padding: 1rem
- Box-shadow: lg
- Width: 300px on desktop, 90% on mobile

**Progress Bar:**
- Height: 0.5rem (8px)
- Background: #e5e7eb
- Border-radius: full
- Overflow: hidden
- Margin-bottom: 0.5rem

**Progress Fill:**
- Background: Linear gradient #667eea to #764ba2
- Height: 100%
- Transition: width 0.3s ease-in-out

**Progress Text:**
- Font size: 0.875rem (14px)
- Color: #6b7280
- Text-align: center

### Success Message
- Position: Fixed top-right
- Background: #d1fae5
- Border: 1px solid #a7f3d0
- Border-radius: md (8px)
- Padding: 1rem
- Color: #065f46
- Font size: 0.875rem (14px)
- Icon: Checkmark
- Auto-dismiss: 3 seconds
- Animation: Slide in from top

### Error Message
- Position: Fixed top-right
- Background: #fee2e2
- Border: 1px solid #fecaca
- Border-radius: md (8px)
- Padding: 1rem
- Color: #dc2626
- Font size: 0.875rem (14px)
- Icon: Alert
- Animation: Slide in from top

---

## Component Specifications

### Input Field
```
Height: 2.75rem (44px)
Padding: 0.75rem 1rem
Border: 1px solid #e5e7eb
Border-radius: md (8px)
Font-size: 1rem (16px)
Font-family: inherit
Transition: all 0.15s ease-in-out
Background: White

Focus State:
  Border-color: #667eea
  Box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1)
  Outline: none

Error State:
  Border-color: #ef4444
  Box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1)

Disabled State:
  Background: #f9fafb
  Cursor: not-allowed
  Opacity: 0.6
```

### Button (Primary)
```
Height: 2.75rem (44px)
Padding: 0.75rem 1.5rem
Background: #1f2937
Color: White
Border: none
Border-radius: md (8px)
Font-size: 1rem (16px)
Font-weight: Semi-bold (600)
Cursor: pointer
Transition: all 0.2s ease-in-out

Hover State:
  Background: #111827
  Transform: translateY(-2px)
  Box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2)

Active State:
  Transform: translateY(0)

Disabled State:
  Opacity: 0.5
  Cursor: not-allowed
```

### Button (Secondary)
```
Height: 2.75rem (44px)
Padding: 0.75rem 1.5rem
Background: #f3f4f6
Color: #1f2937
Border: 1px solid #e5e7eb
Border-radius: md (8px)
Font-size: 1rem (16px)
Font-weight: Semi-bold (600)
Cursor: pointer
Transition: all 0.2s ease-in-out

Hover State:
  Background: #e5e7eb
  Border-color: #d1d5db
```

### Card
```
Background: White
Border: 1px solid #e5e7eb
Border-radius: lg (12px)
Box-shadow: sm
Padding: 1.5rem
Transition: all 0.3s ease-in-out

Hover State:
  Box-shadow: md
  Transform: translateY(-2px)
```

### Badge
```
Display: inline-block
Padding: 0.25rem 0.75rem
Background: #f3f4f6
Color: #1f2937
Border-radius: full
Font-size: 0.75rem (12px)
Font-weight: Semi-bold (600)
```

---

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Adjustments (< 640px)
- Single column layout
- Larger touch targets (min 44px)
- Reduced padding: 1rem instead of 1.5rem
- Larger font sizes for readability
- Full-width buttons and inputs
- Simplified navigation (hamburger menu)
- Reduced spacing between sections

### Tablet Adjustments (640px - 1024px)
- Two column layout where applicable
- Balanced spacing
- Medium font sizes
- Optimized touch targets

### Desktop Adjustments (> 1024px)
- Full layout with all features
- Optimized spacing
- Standard font sizes
- Hover states enabled

---

## Animations & Transitions

### Premium Smooth Transitions
- Button hover: 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) - Smooth elastic
- Input focus: 0.25s cubic-bezier(0.4, 0, 0.2, 1) - Material motion
- Card hover: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) - Smooth elastic
- Dropdown: 0.3s cubic-bezier(0.4, 0, 0.2, 1) - Material motion
- Link hover: 0.25s ease-out - Smooth ease
- Form field: 0.3s cubic-bezier(0.4, 0, 0.2, 1) - Material motion

### Keyframes & Effects
- **Fade In**: 0.4s cubic-bezier(0.4, 0, 0.2, 1) - Smooth entrance
- **Slide Up**: 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) - Elastic entrance
- **Slide In Right**: 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) - Elastic entrance
- **Pulse**: 2s ease-in-out infinite - Gentle breathing effect
- **Bounce**: 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) - Elastic bounce
- **Glow**: 0.4s ease-out - Soft glow effect on focus
- **Scale**: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) - Smooth scale
- **Shimmer**: 1.5s ease-in-out infinite - Loading shimmer effect

### Micro-interactions
- Button: Subtle scale (1.02x) + shadow increase on hover
- Input: Soft glow effect + border color transition on focus
- Card: Gentle lift (translateY -4px) + shadow increase on hover
- Link: Underline animation with smooth width transition
- Form validation: Smooth color transition + icon fade-in
- Loading state: Gentle pulse with opacity variation

---

## Accessibility

### Color Contrast
- Text on background: Minimum 4.5:1 ratio (WCAG AA)
- Interactive elements: Minimum 3:1 ratio
- Large text (18px+): Minimum 3:1 ratio

### Focus States
- All interactive elements have visible focus indicator
- Focus outline: 2px solid #667eea
- Outline offset: 2px
- Focus visible on keyboard navigation

### Keyboard Navigation
- Tab order follows visual flow (left to right, top to bottom)
- All buttons and inputs are keyboard accessible
- Escape key closes modals and dropdowns
- Enter key submits forms
- Space key activates buttons

### Screen Readers
- Semantic HTML (button, input, label, etc.)
- ARIA labels for icon-only buttons
- Form labels associated with inputs (for attribute)
- Error messages linked to inputs (aria-describedby)
- Skip to main content link
- Proper heading hierarchy (h1, h2, h3)

### Motion
- Respect prefers-reduced-motion
- Animations disabled for users who prefer reduced motion
- No auto-playing videos or animations

---

## Dark Mode (Future Implementation)

When implementing dark mode:
- Background: `#111827`
- Surface: `#1f2937`
- Surface Light: `#374151`
- Text Primary: `#f9fafb`
- Text Secondary: `#d1d5db`
- Border: `#4b5563`
- Adjust shadows for visibility
- Increase contrast ratios

---

## Loading States

### Skeleton Loading
- Background: #e5e7eb
- Animation: Pulse effect
- Border-radius: Match component

### Spinner
- Size: 24px x 24px
- Color: #667eea
- Animation: Rotate 360deg in 1s infinite

### Progress Bar
- Height: 4px
- Background: #e5e7eb
- Fill: Linear gradient #667eea to #764ba2
- Animation: Smooth width transition





---

## Premium Design Implementation Notes

### Design Aesthetic (Updated - Session 2)
The UI has been updated to match a premium, smooth aesthetic inspired by modern craft beverage brands. The design features:

**Color Palette Refinement:**
- Soft Lavender (#a78bfa) as primary accent - warm and inviting
- Soft Sky Blue (#60a5fa) as secondary accent - calm and professional
- Warm Off-white (#fafaf9) as primary background - reduces eye strain
- Ultra-light Lavender (#f5f3ff) for subtle backgrounds - creates depth
- Soft Charcoal (#2d3748) for text - maintains readability with warmth

**Animation Philosophy:**
- Cubic-bezier easing (0.34, 1.56, 0.64, 1) for elastic, smooth transitions
- Longer transition times (0.3s - 0.4s) for premium feel
- Staggered animations for form elements (0.1s - 0.4s delays)
- Floating background elements for subtle depth
- Micro-interactions on all interactive elements

**Key Features:**
- Smooth fade-in animations on page load
- Elastic button hover effects with scale and shadow
- Gradient underlines on links with smooth width transitions
- Soft glow effects on input focus
- Floating background gradients for ambient movement
- Shimmer effects on loading states
- Staggered form field animations for visual hierarchy

### Implementation Files Updated
1. `login_form.module.css` - Premium login form styling
2. `image_upload.module.css` - Premium upload component styling
3. `login_page.module.css` - Login page background with floating elements
4. `upload_page.module.css` - Upload page background with floating elements
5. `ui_design.md` - Updated design specifications with new color palette and animations
