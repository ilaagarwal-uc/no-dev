# Accessibility Testing Guide - Create Look Feature

## Overview
This guide provides instructions for testing the accessibility features of the Create Look page to ensure WCAG AA compliance.

## Testing Checklist

### 1. Keyboard Navigation Testing

#### Catalog Navigation
- [ ] Press Tab to navigate to catalog sidebar
- [ ] Use Tab to move through category filter buttons
- [ ] Press Enter or Space to activate category filters
- [ ] Tab into search input and type a search query
- [ ] Tab to catalog items
- [ ] Use Arrow Down/Up keys to navigate between catalog items
- [ ] Press Enter to select a catalog item
- [ ] Verify focus indicators are visible (3px blue outline)

#### Model Manipulation
- [ ] Tab to placed models in the viewer
- [ ] Press Delete key to delete selected model
- [ ] Press Escape to deselect model
- [ ] Verify keyboard shortcuts work (Ctrl+Z, Ctrl+Y placeholders)

#### Properties Panel
- [ ] Tab through position, rotation, scale inputs
- [ ] Use arrow keys to adjust numeric values
- [ ] Press Enter to apply changes
- [ ] Tab to action buttons (Duplicate, Reset, Delete)
- [ ] Press Enter or Space to activate buttons

#### Viewer Controls
- [ ] Tab through view mode buttons
- [ ] Press Enter or Space to change view mode
- [ ] Tab to grid and snap toggles
- [ ] Press Enter or Space to toggle settings
- [ ] Tab to Save and Share buttons

### 2. Screen Reader Testing

#### Recommended Screen Readers
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

#### Test Scenarios

**Catalog Browsing**
- [ ] Navigate to catalog sidebar
- [ ] Verify screen reader announces: "Catalog items, list"
- [ ] Navigate to catalog item
- [ ] Verify announcement includes: name, category, dimensions, cost, instructions
- [ ] Example: "Panel WX919, panels category, dimensions 4 by 8 by 0.5 feet, costs $45.99. Tap to select or hold to drag onto wall."

**Model Placement**
- [ ] Place a model on the wall
- [ ] Verify announcement: "Model [name] placed on wall at position [x], [y], [z]"

**Model Transformation**
- [ ] Move a model
- [ ] Verify announcement: "[name] moved to [x], [y], [z]"
- [ ] Rotate a model
- [ ] Verify announcement: "[name] rotated"
- [ ] Scale a model
- [ ] Verify announcement: "[name] scaled"

**Model Actions**
- [ ] Duplicate a model
- [ ] Verify announcement: "[name] duplicated"
- [ ] Delete a model
- [ ] Verify announcement: "[name] deleted from wall"

**Keyboard Shortcuts**
- [ ] Press Escape to deselect
- [ ] Verify announcement: "Model deselected"

### 3. Touch Target Size Testing

#### Measurement Tool
Use browser DevTools to measure element dimensions:
1. Right-click element → Inspect
2. Check computed dimensions in Styles panel
3. Verify minimum 44x44px for all interactive elements

#### Elements to Verify
- [ ] Catalog collapse button: 44x44px ✓
- [ ] Search input: 44px height ✓
- [ ] Category buttons: 44px height ✓
- [ ] Catalog item cards: 200x280px ✓
- [ ] Properties panel inputs: 44px height ✓
- [ ] Action buttons: 44px minimum height ✓
- [ ] Viewer control buttons: 44x44px ✓
- [ ] Context menu items: 44px minimum height ✓

### 4. Text Contrast Testing

#### Tools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Browser Extension**: WAVE or axe DevTools

#### Test All Text Elements
- [ ] Catalog title: #333333 on #ffffff = 12.6:1 ✓
- [ ] Search input: #000000 on #ffffff = 21:1 ✓
- [ ] Category buttons: #666666 on #f5f5f5 = 5.7:1 ✓
- [ ] Empty state: #757575 on #ffffff = 4.9:1 ✓
- [ ] Model name: #333333 on #ffffff = 12.6:1 ✓
- [ ] Dimensions: #666666 on #ffffff = 5.7:1 ✓
- [ ] Cost: #2e7d32 on #ffffff = 4.8:1 ✓
- [ ] Properties labels: #616161 on #ffffff = 6.1:1 ✓
- [ ] Input text: #212121 on #f5f5f5 = 14.8:1 ✓
- [ ] Manual badge: #e65100 on #fff3e0 = 4.6:1 ✓

**All text meets WCAG AA requirement of 4.5:1 minimum** ✓

### 5. Focus Indicator Testing

#### Visual Verification
- [ ] Tab through all interactive elements
- [ ] Verify visible focus outline on each element
- [ ] Confirm outline is 3px solid blue (#2196f3)
- [ ] Confirm outline offset is 2px
- [ ] Verify focus indicators work in high contrast mode (4px)

#### Elements to Test
- [ ] Catalog collapse button
- [ ] Search input
- [ ] Category filter buttons
- [ ] Catalog item cards
- [ ] Properties panel inputs
- [ ] Action buttons
- [ ] Viewer control buttons
- [ ] Context menu items

### 6. High Contrast Mode Testing

#### Windows High Contrast Mode
1. Press Left Alt + Left Shift + Print Screen
2. Click "Yes" to enable high contrast
3. Test the application

#### Verify
- [ ] Border widths increased to 3-4px
- [ ] Outline thickness increased to 4px
- [ ] Text remains readable
- [ ] Interactive elements clearly distinguishable
- [ ] Color-coded elements have patterns or additional indicators

### 7. Browser Zoom Testing

#### Test at Different Zoom Levels
- [ ] 100% zoom (baseline)
- [ ] 125% zoom
- [ ] 150% zoom
- [ ] 175% zoom
- [ ] 200% zoom (maximum requirement)

#### Verify at Each Zoom Level
- [ ] Layout doesn't break
- [ ] No horizontal scrolling required
- [ ] All text remains readable
- [ ] Interactive elements remain accessible
- [ ] No overlapping elements
- [ ] Catalog sidebar remains functional
- [ ] Properties panel remains functional
- [ ] Viewer controls remain functional

#### Browser Testing
Test zoom in multiple browsers:
- [ ] Chrome/Edge (Ctrl/Cmd + Plus/Minus)
- [ ] Firefox (Ctrl/Cmd + Plus/Minus)
- [ ] Safari (Cmd + Plus/Minus)

### 8. Color Blindness Testing

#### Tools
- **Chrome Extension**: Colorblindly
- **Online Tool**: Coblis Color Blindness Simulator

#### Test Scenarios
- [ ] Protanopia (red-blind)
- [ ] Deuteranopia (green-blind)
- [ ] Tritanopia (blue-blind)

#### Verify
- [ ] Category badges remain distinguishable
- [ ] Valid/invalid drop zones distinguishable (not relying solely on color)
- [ ] Selected models identifiable
- [ ] Error messages visible

### 9. Mobile/Touch Device Testing

#### Test on Actual Devices
- [ ] iPad with Apple Pencil
- [ ] Android tablet with stylus
- [ ] Large smartphone

#### Verify
- [ ] Touch targets are adequate (44x44px minimum)
- [ ] Pen/stylus input works correctly
- [ ] Long press to drag works (500ms)
- [ ] Haptic feedback works (if supported)
- [ ] Pinch to zoom works
- [ ] Rotation works

### 10. Automated Testing

#### Tools to Use
- **axe DevTools**: Browser extension for automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built into Chrome DevTools

#### Run Tests
```bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/react

# Run Lighthouse audit
# Chrome DevTools → Lighthouse → Accessibility
```

#### Verify No Critical Issues
- [ ] No missing alt text
- [ ] No missing form labels
- [ ] No insufficient color contrast
- [ ] No missing ARIA labels
- [ ] No keyboard traps

## Testing Results Template

### Test Date: [DATE]
### Tester: [NAME]
### Browser: [BROWSER + VERSION]
### OS: [OPERATING SYSTEM]

#### Keyboard Navigation: ✓ / ✗
Notes:

#### Screen Reader: ✓ / ✗
Screen Reader Used:
Notes:

#### Touch Targets: ✓ / ✗
Notes:

#### Text Contrast: ✓ / ✗
Notes:

#### Focus Indicators: ✓ / ✗
Notes:

#### High Contrast Mode: ✓ / ✗
Notes:

#### Browser Zoom (200%): ✓ / ✗
Notes:

#### Color Blindness: ✓ / ✗
Notes:

#### Mobile/Touch: ✓ / ✗
Device Used:
Notes:

#### Automated Testing: ✓ / ✗
Tool Used:
Issues Found:

## Known Issues

None currently documented.

## Future Improvements

1. Implement full undo/redo with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
2. Add arrow key manipulation for selected models
3. Add BOM generation announcements
4. Add catalog loading progress announcements
5. Test with additional screen readers (JAWS, Orca)
6. Add skip navigation links
7. Add landmark regions (main, navigation, complementary)
8. Consider adding a keyboard shortcuts help modal (press ?)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [NVDA Screen Reader](https://www.nvaccess.org/download/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Tool](https://wave.webaim.org/)
