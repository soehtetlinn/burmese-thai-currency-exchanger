# Bootstrap Quick Reference Guide

## Common Bootstrap Classes Used

### Layout & Grid
```html
<!-- Container -->
<div className="container">                  <!-- Responsive container -->
<div className="row g-4">                    <!-- Row with gap-4 -->
<div className="col-12 col-md-6">           <!-- Full width on mobile, half on desktop -->

<!-- Flexbox -->
<div className="d-flex justify-content-between align-items-center">
<div className="d-flex flex-column gap-3">
```

### Cards
```html
<!-- Basic Card -->
<div className="card glass-card">
  <div className="card-header border-0">
    <h2 className="fw-bold fs-2 mb-0">Title</h2>
  </div>
  <div className="card-body">
    Content
  </div>
  <div className="card-footer">
    Footer
  </div>
</div>
```

### Buttons
```html
<!-- Primary Button -->
<button className="btn btn-primary">
  <i className="bi bi-check-circle-fill me-2"></i>
  Submit
</button>

<!-- Secondary Button -->
<button className="btn btn-secondary">Cancel</button>

<!-- Button with Loading -->
<button className="btn btn-primary" disabled>
  <span className="spinner-border spinner-border-sm me-2"></span>
  Loading...
</button>
```

### Forms
```html
<!-- Form Group -->
<div className="mb-3">
  <label className="form-label">
    <i className="bi bi-envelope me-2"></i>
    Email
  </label>
  <input type="email" className="form-control" placeholder="Enter email" />
</div>

<!-- Select -->
<select className="form-select">
  <option>Choose...</option>
</select>

<!-- Textarea -->
<textarea className="form-control" rows="3"></textarea>
```

### Alerts
```html
<!-- Info Alert -->
<div className="alert alert-info" role="alert">
  <i className="bi bi-info-circle-fill me-2"></i>
  This is an info alert
</div>

<!-- Success Alert -->
<div className="alert alert-success">Success message</div>

<!-- Danger Alert -->
<div className="alert alert-danger">Error message</div>
```

### Badges
```html
<span className="badge bg-primary">Primary</span>
<span className="badge bg-success">Success</span>
<span className="badge bg-secondary">Secondary</span>
```

### Tables
```html
<div className="table-responsive">
  <table className="table table-hover">
    <thead>
      <tr>
        <th scope="col">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Navbar
```html
<nav className="navbar navbar-expand-lg sticky-top">
  <div className="container-fluid">
    <a className="navbar-brand" href="/">Brand</a>
    <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav">
      <i className="bi bi-list"></i>
    </button>
    <div className="collapse navbar-collapse" id="nav">
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link active" href="/">Home</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

### Modal
```html
<div className="modal show d-block">
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Title</h5>
        <button className="btn-close"></button>
      </div>
      <div className="modal-body">Content</div>
      <div className="modal-footer">
        <button className="btn btn-primary">OK</button>
      </div>
    </div>
  </div>
</div>
```

### Spinners
```html
<!-- Border Spinner -->
<div className="spinner-border text-accent"></div>

<!-- Small Spinner -->
<span className="spinner-border spinner-border-sm"></span>

<!-- Growing Spinner -->
<div className="spinner-grow"></div>
```

### Bootstrap Icons
```html
<i className="bi bi-calculator"></i>           <!-- Calculator -->
<i className="bi bi-graph-up"></i>             <!-- Graph -->
<i className="bi bi-gear-fill"></i>            <!-- Settings -->
<i className="bi bi-arrow-clockwise"></i>      <!-- Refresh -->
<i className="bi bi-check-circle-fill"></i>    <!-- Check -->
<i className="bi bi-exclamation-triangle"></i> <!-- Warning -->
<i className="bi bi-info-circle"></i>          <!-- Info -->
<i className="bi bi-chat-dots-fill"></i>       <!-- Chat -->
<i className="bi bi-send-fill"></i>            <!-- Send -->
```

### Spacing Utilities
```
m-0, m-1, m-2, m-3, m-4, m-5        <!-- Margin -->
p-0, p-1, p-2, p-3, p-4, p-5        <!-- Padding -->
mt-3, mb-3, ms-3, me-3              <!-- Margin top, bottom, start, end -->
pt-3, pb-3, ps-3, pe-3              <!-- Padding top, bottom, start, end -->
mx-auto                              <!-- Horizontal center -->
g-3, g-4                            <!-- Gap (for flex/grid) -->
gap-2, gap-3                        <!-- Gap utility -->
```

### Text Utilities
```
text-start, text-center, text-end    <!-- Alignment -->
text-muted                           <!-- Muted text -->
text-white, text-dark                <!-- Colors -->
text-accent                          <!-- Custom accent color -->
fw-bold, fw-semibold, fw-medium      <!-- Font weight -->
fs-1, fs-2, fs-3, fs-4, fs-5, fs-6  <!-- Font size -->
font-monospace                       <!-- Monospace font -->
```

### Display & Visibility
```
d-none, d-block, d-inline-block      <!-- Display -->
d-md-block                           <!-- Responsive display -->
d-flex                               <!-- Flexbox -->
justify-content-between              <!-- Flex justify -->
align-items-center                   <!-- Flex align -->
flex-column, flex-row                <!-- Flex direction -->
flex-wrap                            <!-- Flex wrap -->
```

### Positioning
```
position-relative                    <!-- Relative positioning -->
position-absolute                    <!-- Absolute positioning -->
position-fixed                       <!-- Fixed positioning -->
position-sticky                      <!-- Sticky positioning -->
top-0, bottom-0, start-0, end-0     <!-- Position offsets -->
```

### Sizing
```
w-100                                <!-- Width 100% -->
h-100                                <!-- Height 100% -->
mw-100                               <!-- Max width 100% -->
min-vh-100                           <!-- Min height 100vh -->
```

### Borders & Rounded
```
border, border-0                     <!-- Border -->
border-top, border-bottom            <!-- Specific borders -->
rounded, rounded-circle              <!-- Border radius -->
rounded-3, rounded-pill              <!-- Border radius sizes -->
```

### Shadows
```
shadow-sm                            <!-- Small shadow -->
shadow                               <!-- Regular shadow -->
shadow-lg                            <!-- Large shadow -->
```

### Custom Classes (from custom-theme.css)
```
glass-card                           <!-- Glassmorphism effect -->
text-accent                          <!-- Accent color text -->
gradient-text                        <!-- Gradient text effect -->
float-animation                      <!-- Floating animation -->
loading-pulse                        <!-- Pulse animation -->
```

## Responsive Breakpoints
- `sm`: ≥576px (small devices)
- `md`: ≥768px (tablets)
- `lg`: ≥992px (desktops)
- `xl`: ≥1200px (large desktops)
- `xxl`: ≥1400px (extra large)

Example: `col-12 col-md-6 col-lg-4`

## Custom CSS Variables
```css
var(--brand-accent)          /* #22d3ee - Cyan */
var(--brand-primary)         /* #334155 - Slate */
var(--brand-bg-start)        /* #0f172a - Dark slate */
var(--brand-surface)         /* rgba(30, 41, 59, 0.5) */
var(--brand-border)          /* rgba(51, 65, 85, 0.7) */
```

## Tips
1. **Combine utilities**: `d-flex justify-content-between align-items-center gap-3`
2. **Responsive modifiers**: `d-none d-md-block` (hidden on mobile, visible on desktop)
3. **Icon spacing**: Always use `me-2` or `ms-2` for proper spacing
4. **Form validation**: Add `is-invalid` class to show validation state
5. **Button states**: Use `disabled` attribute for loading states

## Resources
- Bootstrap Docs: https://getbootstrap.com/docs/5.3/
- Bootstrap Icons: https://icons.getbootstrap.com/
- Custom Theme: `/public/custom-theme.css`

