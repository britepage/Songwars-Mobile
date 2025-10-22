<!-- d37e2ddc-29e1-4b1d-bb15-59cfe87c56ae 40c8cf60-3bd0-4c93-b7f6-6584d238e123 -->
# Fix Genre Selection Styling to Match Production

## Problem

The genre selection dropdown in dev has dark theme styling while production has light theme styling.

**Dev Issues:**
- Dark/black background for the `ion-item` container
- White text for "Select Genre" label
- Dark gray/black background for the `ion-select` input field
- No visible border on the input field
- Overall dark aesthetic that doesn't match production

**Production Requirements:**
- White background for the entire dropdown area
- Black text for "Select Genre" label
- White background for the input field
- Light gray border around the input field
- Light gray placeholder text ("Choose genre")
- Clean, light theme aesthetic

## Solution

Override Ionic's default component styling for `ion-item` and `ion-select` to force light theme appearance, ensuring the genre selection matches production.

## Required Changes

### File: `src/views/main/DashboardPage.vue`

#### Current CSS (lines 838-842):

```css
.genre-card {
  margin-bottom: 1rem;
  --background: white;
  box-shadow: none;
}
```

#### Updated CSS:

```css
.genre-card {
  margin-bottom: 1rem;
  --background: white;
  box-shadow: none;
}

.genre-card ion-item {
  --background: white;
  --color: black;
  --border-color: #e5e7eb;
}

.genre-card ion-select {
  --background: white;
  --color: black;
  --placeholder-color: #9ca3af;
}
```

### Explanation:

1. **`.genre-card ion-item`**:
   - `--background: white` - Forces white background for the entire item container (affects "Select Genre" section)
   - `--color: black` - Forces black text color for the label
   - `--border-color: #e5e7eb` - Sets light gray border color

2. **`.genre-card ion-select`**:
   - `--background: white` - Forces white background for the select input field
   - `--color: black` - Forces black text color for selected value
   - `--placeholder-color: #9ca3af` - Sets light gray color for "Choose genre" placeholder

## Result

This will transform the genre selection from dark theme to light theme, matching production exactly:
- ✅ White background throughout
- ✅ Black text for "Select Genre"
- ✅ White input field with proper styling
- ✅ Light gray placeholder text
- ✅ Light gray border (via Ionic's default item borders)

## Files to Modify

1. `src/views/main/DashboardPage.vue` - Add CSS rules for `.genre-card ion-item` and `.genre-card ion-select` (after line 842)

### To-dos

- [ ] Add light theme CSS overrides for ion-item within genre-card
- [ ] Add light theme CSS overrides for ion-select within genre-card
