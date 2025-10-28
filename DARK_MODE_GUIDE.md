# 🌓 Dark Mode Feature Guide

## Overview
Your Currency Exchanger now has a beautiful **Dark/Light Mode Toggle** feature! Users can switch between themes with a single click.

## Features

### 🌙 Dark Mode (Default)
- **Background**: Dark slate gradient (#0f172a → #1e293b)
- **Accent**: Bright cyan (#22d3ee)
- **Text**: Light slate (#f1f5f9)
- **Cards**: Glassmorphism with dark translucent background
- **Perfect for**: Night-time use, reduced eye strain

### ☀️ Light Mode
- **Background**: Light slate gradient (#f8fafc → #e2e8f0)
- **Accent**: Ocean blue (#0891b2)
- **Text**: Dark slate (#0f172a)
- **Cards**: Glassmorphism with white translucent background
- **Perfect for**: Daytime use, high visibility

## How It Works

### User Experience
1. Look for the theme toggle button in the **navigation bar** (top right)
2. Click the button to instantly switch themes
3. Your preference is **automatically saved** to localStorage
4. Theme persists across page refreshes and browser sessions

### Theme Toggle Button
- **Dark Mode**: Shows sun icon ☀️ with "Light" label
- **Light Mode**: Shows moon icon 🌙 with "Dark" label
- **Responsive**: Label hides on small screens, icon remains visible
- **Smooth**: Animated transition between themes

## Technical Implementation

### Files Created
1. **`/hooks/useTheme.tsx`** - Theme context and hook
   - Manages theme state
   - Saves to localStorage
   - Provides theme toggle function

2. **`/components/ThemeToggle.tsx`** - Toggle button component
   - Beautiful button with icons
   - Shows current theme option
   - Accessible with ARIA labels

### Files Modified
1. **`/public/custom-theme.css`** - Added light mode styles
   - Light mode CSS variables
   - Component-specific light mode overrides
   - Smooth transitions

2. **`/App.tsx`** - Added ThemeProvider
   - Wraps entire app
   - Provides theme context

3. **`/components/Header.tsx`** - Added ThemeToggle
   - Positioned in navigation
   - Responsive layout

## Usage in Code

### Access Theme in Any Component
```tsx
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}
```

### Check Current Theme
```tsx
const { theme } = useTheme();
const isDark = theme === 'dark';
```

## Customization

### Change Light Mode Colors
Edit `/public/custom-theme.css`:

```css
[data-theme="light"] {
  --brand-accent: #0891b2; /* Change this */
  --brand-bg-start: #f8fafc; /* Change this */
  /* ... more colors */
}
```

### Change Dark Mode Colors
```css
[data-theme="dark"] {
  --brand-accent: #22d3ee; /* Change this */
  --brand-bg-start: #0f172a; /* Change this */
  /* ... more colors */
}
```

### Add Custom Theme-Specific Styles
```css
/* For light mode only */
[data-theme="light"] .my-component {
  /* styles */
}

/* For dark mode only */
[data-theme="dark"] .my-component {
  /* styles */
}
```

## Theme Persistence

### How It Works
1. User changes theme → Saved to `localStorage` as `currex-theme`
2. Page refresh → Theme restored from localStorage
3. First visit → Checks system preference (prefers-color-scheme)
4. No preference → Defaults to dark mode

### Manual Theme Check
```javascript
// In browser console
localStorage.getItem('currex-theme') // Returns 'dark' or 'light'
```

### Reset Theme
```javascript
// In browser console
localStorage.removeItem('currex-theme')
// Refresh page - will use system preference or default to dark
```

## Accessibility

### ARIA Support
- Button has descriptive `aria-label`
- Title attribute for tooltips
- Clear visual indicators

### Keyboard Navigation
- Tab to focus the toggle button
- Enter or Space to activate

### Screen Readers
- Announces "Switch to Light Mode" or "Switch to Dark Mode"

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge (88+)
- ✅ Firefox (87+)
- ✅ Safari (14+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Smooth Transitions

All theme changes are animated:
```css
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

This creates smooth color transitions when switching themes!

## Testing Checklist

Test the dark mode feature:

- [ ] **Toggle Button Visible**: Check navigation bar
- [ ] **Click Toggle**: Switch from dark to light
- [ ] **Click Again**: Switch back to dark
- [ ] **Check All Pages**: Home, History, Admin
- [ ] **Refresh Page**: Theme should persist
- [ ] **Mobile View**: Toggle should work on small screens
- [ ] **Check Forms**: Inputs should be readable in both modes
- [ ] **Check Charts**: Charts should be visible in both modes
- [ ] **Check Modal**: Modal should look good in both modes
- [ ] **Check Chat**: Chat widget should work in both modes

## Theme Comparison

### Component Appearance

| Component | Dark Mode | Light Mode |
|-----------|-----------|------------|
| Background | Dark slate gradient | Light slate gradient |
| Cards | Dark translucent | White translucent |
| Text | Light slate | Dark slate |
| Accent | Bright cyan | Ocean blue |
| Buttons | Cyan gradient | Blue gradient |
| Forms | Dark inputs | White inputs |
| Shadows | Black shadows | Light shadows |

## System Preference Detection

The app automatically detects your system's preferred color scheme:

```tsx
// Checks system preference
if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  return 'light';
}
```

### Override System Preference
Users can override system preference by clicking the toggle. Their choice will be saved and used on future visits.

## Performance

- **Zero impact**: Theme switching is instant
- **CSS-only**: No JavaScript calculations
- **Efficient**: Uses CSS variables for theme values
- **Cached**: Theme preference saved locally

## Future Enhancements

Potential additions:
- Auto-switch based on time of day
- Multiple theme options (not just light/dark)
- Theme scheduling (dark at night, light during day)
- More color schemes
- High contrast mode

## Troubleshooting

### Theme Not Switching?
1. Check browser console for errors
2. Verify localStorage is enabled
3. Hard refresh (Ctrl+Shift+R)

### Colors Look Wrong?
1. Check `/public/custom-theme.css` is loaded
2. Verify CSS variables are defined
3. Check browser DevTools for overriding styles

### Toggle Button Not Visible?
1. Check Header component rendered
2. Verify ThemeProvider wraps the app
3. Check for CSS conflicts

## Code Architecture

```
App (ThemeProvider)
├── Header
│   └── ThemeToggle ← User clicks here
├── Main Content
│   ├── HomePage
│   ├── HistoryPage
│   └── AdminPage
└── WebChatWidget

Theme flows down via Context API
```

## Summary

✨ **Features:**
- Instant theme switching
- Persistent across sessions
- System preference detection
- Smooth animations
- Fully accessible
- Mobile responsive

🎨 **Themes:**
- Dark Mode (default) - Eye-friendly with cyan accents
- Light Mode - Clean and bright with blue accents

🚀 **Implementation:**
- Context API for state management
- CSS variables for theming
- localStorage for persistence
- Bootstrap Icons for UI

---

**Enjoy your new dark mode feature!** 🌓

Switch between themes and see which one you prefer. Both are designed to look beautiful and professional! ✨

