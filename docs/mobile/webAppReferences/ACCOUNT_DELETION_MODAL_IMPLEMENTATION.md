# Account Deletion Modal - Web App Implementation Reference

**Document Purpose**: This document provides complete implementation details of the Account Deletion Modal from the production web app, enabling exact mobile app parity.

**Last Updated**: January 2025  
**Web App Files Referenced**:
- `components/AccountDeletionModal.vue` (complete file, 239 lines)
- `pages/account.vue` (lines 289-304)

---

## Table of Contents

1. [Overview](#overview)
2. [Modal Flow](#modal-flow)
3. [Visual Specifications](#visual-specifications)
4. [Step 1: Initial Warning](#step-1-initial-warning)
5. [Step 2: Type Confirmation](#step-2-type-confirmation)
6. [Step 3: Deletion in Progress](#step-3-deletion-in-progress)
7. [Step 4: Success](#step-4-success)
8. [Step 5: Error](#step-5-error)
9. [Component Integration](#component-integration)
10. [Complete Code Reference](#complete-code-reference)

---

## Overview

The Account Deletion Modal is a multi-step confirmation flow that ensures users understand the consequences of deleting their account before proceeding. It provides clear warnings, requires explicit confirmation, and shows progress/status feedback.

**Key Features:**
- 5-step process with clear transitions
- Dark theme styling (gray-900 background)
- Emoji-based visual feedback
- Type confirmation requirement ("DELETE")
- Loading states and error handling
- Auto-redirect after successful deletion
- Can be closed/cancelled at appropriate steps

**Theme**: **Dark theme** with `bg-gray-900` background, NOT light theme

---

## Modal Flow

### Step Progression

```
Step 1: Initial Warning
   ↓ (Click "I Understand, Continue")
Step 2: Type Confirmation
   ↓ (Type "DELETE" and click "Delete My Account")
Step 3: Deletion in Progress
   ↓ (API call completes)
Step 4: Success → Auto-redirect
   OR
Step 5: Error → Retry option
```

### Navigation Options

| Step | Can Close | Can Go Back | Can Proceed |
|------|-----------|-------------|-------------|
| 1 | ✅ Yes (Cancel) | ❌ No | ✅ Yes (Continue) |
| 2 | ❌ No | ✅ Yes (Back) | ✅ Yes (if typed DELETE) |
| 3 | ❌ No | ❌ No | ⏳ Automatic |
| 4 | ❌ No | ❌ No | ⏳ Auto-redirect |
| 5 | ✅ Yes (Close) | ❌ No | ✅ Yes (Try Again) |

---

## Visual Specifications

### Modal Container

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| **Background** | Gray-900 | `bg-gray-900` |
| **Border Radius** | 12px | `rounded-xl` |
| **Max Width** | 448px | `max-w-md` |
| **Width** | 100% | `w-full` |
| **Padding** | 24px | `p-6` |
| **Z-Index** | 50 | `z-50` |

### Backdrop

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| **Position** | Fixed full screen | `fixed inset-0` |
| **Background** | Black @ 50% opacity | `bg-black bg-opacity-50` |
| **Display** | Flexbox centered | `flex items-center justify-center` |

### Typography

| Element | Font Size | Font Weight | Color | Tailwind Classes |
|---------|-----------|-------------|-------|------------------|
| **Modal Title** | 20px | Bold | White | `text-xl font-bold text-white` |
| **Step Headers** | 18px | Semibold | White | `text-lg font-semibold text-white` |
| **Body Text** | 14px | Normal | Gray-300 | `text-sm text-gray-300` |
| **Warning Text** | 14px | Normal | Red-400 | `text-sm text-red-400` |
| **Helper Text** | 12px | Normal | Gray-400 | `text-xs text-gray-400` |
| **List Items** | 14px | Normal | Red-400 | `text-sm text-red-400` |

### Color Palette

| Usage | Color | Hex/Class | Background |
|-------|-------|-----------|------------|
| **Modal Background** | Gray-900 | `bg-gray-900` | - |
| **Primary Text** | White | `text-white` | - |
| **Secondary Text** | Gray-300 | `text-gray-300` | - |
| **Muted Text** | Gray-400 | `text-gray-400` | - |
| **Warning Box** | Red-400 text | `text-red-400` | `bg-red-500/10` |
| **Warning Border** | Red-500 @ 20% | - | `border-red-500/20` |
| **Info Box** | Blue-400 text | `text-blue-400` | `bg-blue-500/10` |
| **Success Box** | Green-400 text | `text-green-400` | `bg-green-500/10` |
| **Danger Button** | White text | `text-white` | `bg-red-600` |
| **Cancel Button** | White text | `text-white` | `bg-gray-600` |

### Button Specifications

| Button Type | Background | Hover | Text | Padding | Border Radius |
|-------------|-----------|-------|------|---------|---------------|
| **Primary (Danger)** | `bg-red-600` | `bg-red-700` | White | `px-4 py-2` | `rounded-lg` |
| **Secondary (Cancel)** | `bg-gray-600` | `bg-gray-700` | White | `px-4 py-2` | `rounded-lg` |
| **Disabled** | 50% opacity | No hover | - | - | - |

### Spacing

| Element | Spacing | Tailwind Class |
|---------|---------|----------------|
| **Content Sections** | 16px vertical | `space-y-4` |
| **Header Margin** | 24px bottom | `mb-6` |
| **Button Gap** | 12px horizontal | `space-x-3` |
| **Info Box Padding** | 12-16px | `p-3` to `p-4` |
| **List Item Spacing** | 4px vertical | `space-y-1` |

---

## Step 1: Initial Warning

### Visual Layout

```
┌─────────────────────────────────────────┐
│ Delete Account                      [X] │  ← Header
├─────────────────────────────────────────┤
│              ⚠️  (large emoji)          │  ← Warning icon
│                                         │
│     Are you absolutely sure?            │  ← Subheader
│                                         │
│  This action will permanently delete    │  ← Warning text
│  your account and all associated data   │
│  including:                             │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ • All your uploaded songs...        │ │  ← Red warning box
│ │ • Your profile and account...       │ │
│ │ • All votes and battle history      │ │
│ │ • Song flags and tags               │ │
│ │ • Weekly scores and competition...  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  This action cannot be undone.          │  ← Final warning
│                                         │
│ [     Cancel     ] [ I Understand... ] │  ← Buttons
└─────────────────────────────────────────┘
```

### Complete HTML Structure

**Location**: `AccountDeletionModal.vue` (lines 20-57)

```vue
<div v-if="step === 1" class="space-y-4">
  <!-- Warning Icon -->
  <div class="text-center">
    <div class="text-red-500 text-6xl mb-4">⚠️</div>
    <h4 class="text-lg font-semibold text-white mb-2">Are you absolutely sure?</h4>
    <p class="text-gray-300 text-sm leading-relaxed">
      This action will <strong>permanently delete your account</strong> and all associated data including:
    </p>
  </div>
  
  <!-- Red Warning Box -->
  <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
    <ul class="text-red-400 text-sm space-y-1">
      <li>• All your uploaded songs (including audio files)</li>
      <li>• Your profile and account settings</li>
      <li>• All votes and battle history</li>
      <li>• Song flags and tags</li>
      <li>• Weekly scores and competition data</li>
    </ul>
  </div>
  
  <!-- Final Warning -->
  <p class="text-gray-400 text-xs text-center">
    <strong>This action cannot be undone.</strong> Once you delete your account, all data will be permanently removed.
  </p>
  
  <!-- Buttons -->
  <div class="flex space-x-3">
    <button 
      @click="closeModal" 
      class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
    >
      Cancel
    </button>
    <button 
      @click="nextStep" 
      class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      I Understand, Continue
    </button>
  </div>
</div>
```

### Exact Text Content

#### Header
```
Delete Account
```

#### Subheader
```
Are you absolutely sure?
```

#### Warning Text
```
This action will permanently delete your account and all associated data including:
```
- Note: "permanently delete your account" is wrapped in `<strong>` tags

#### Deletion List (5 Items)
```
• All your uploaded songs (including audio files)
• Your profile and account settings
• All votes and battle history
• Song flags and tags
• Weekly scores and competition data
```

#### Final Warning
```
This action cannot be undone. Once you delete your account, all data will be permanently removed.
```
- Note: "This action cannot be undone." is wrapped in `<strong>` tags

#### Button Text
- **Cancel Button**: "Cancel"
- **Continue Button**: "I Understand, Continue"

### Red Warning Box Styling

**Complete Styling**:
```css
background: bg-red-500/10        /* Red with 10% opacity */
border: border-red-500/20        /* Red with 20% opacity */
border-radius: rounded-lg        /* 8px */
padding: p-4                     /* 16px */
text-color: text-red-400         /* Red-400 for text */
```

**List Styling**:
```css
font-size: text-sm               /* 14px */
spacing: space-y-1               /* 4px between items */
color: text-red-400              /* Red-400 */
```

---

## Step 2: Type Confirmation

### Visual Layout

```
┌─────────────────────────────────────────┐
│ Delete Account                      [X] │
├─────────────────────────────────────────┤
│              🗑️  (trash emoji)          │
│                                         │
│        Final Confirmation               │
│                                         │
│  To confirm account deletion, please    │
│  type DELETE in the field below:        │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Type DELETE to confirm...           │ │  ← Input field
│ └─────────────────────────────────────┘ │
│ Please type exactly "DELETE"            │  ← Error (if wrong)
│                                         │
│ [      Back      ] [ Delete My Account ]│
└─────────────────────────────────────────┘
```

### Complete HTML Structure

**Location**: `AccountDeletionModal.vue` (lines 60-98)

```vue
<div v-if="step === 2" class="space-y-4">
  <!-- Icon and Header -->
  <div class="text-center">
    <div class="text-red-500 text-6xl mb-4">🗑️</div>
    <h4 class="text-lg font-semibold text-white mb-2">Final Confirmation</h4>
    <p class="text-gray-300 text-sm">
      To confirm account deletion, please type <strong>DELETE</strong> in the field below:
    </p>
  </div>
  
  <!-- Input Field -->
  <div>
    <input
      v-model="confirmationText"
      type="text"
      placeholder="Type DELETE to confirm"
      class="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
      :class="{ 'border-red-500': confirmationText && confirmationText !== 'DELETE' }"
    />
    <p v-if="confirmationText && confirmationText !== 'DELETE'" class="text-red-400 text-xs mt-1">
      Please type exactly "DELETE" to confirm
    </p>
  </div>
  
  <!-- Buttons -->
  <div class="flex space-x-3">
    <button 
      @click="previousStep" 
      class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
    >
      Back
    </button>
    <button 
      @click="confirmDeletion" 
      :disabled="confirmationText !== 'DELETE' || isDeleting"
      class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="isDeleting">Deleting...</span>
      <span v-else>Delete My Account</span>
    </button>
  </div>
</div>
```

### Exact Text Content

#### Header
```
Final Confirmation
```

#### Instructions
```
To confirm account deletion, please type DELETE in the field below:
```
- Note: "DELETE" is wrapped in `<strong>` tags

#### Input Placeholder
```
Type DELETE to confirm
```

#### Validation Error
```
Please type exactly "DELETE" to confirm
```
- Shows when user types anything other than "DELETE"
- Red text (`text-red-400`)

#### Button Text
- **Back Button**: "Back"
- **Delete Button (Normal)**: "Delete My Account"
- **Delete Button (Loading)**: "Deleting..."

### Input Field Styling

**Normal State**:
```css
width: w-full
padding: px-4 py-3              /* 16px horizontal, 12px vertical */
background: bg-black
border: border-gray-700
border-radius: rounded-lg        /* 8px */
text-color: text-white
placeholder: placeholder-gray-400
```

**Focus State**:
```css
outline: none
ring: ring-2 ring-red-500
border: border-red-500
```

**Error State** (wrong text entered):
```css
border: border-red-500
```

### Button States

**Delete Button - Enabled**:
- Background: `bg-red-600`
- Hover: `bg-red-700`
- Text: "Delete My Account"

**Delete Button - Disabled**:
- Opacity: 50% (`disabled:opacity-50`)
- Cursor: not-allowed (`disabled:cursor-not-allowed`)
- Condition: `confirmationText !== 'DELETE' || isDeleting`

**Delete Button - Loading**:
- Text: "Deleting..."
- Still disabled during operation

---

## Step 3: Deletion in Progress

### Visual Layout

```
┌─────────────────────────────────────────┐
│ Delete Account                      [X] │
├─────────────────────────────────────────┤
│                                         │
│              ⟳  (spinner)               │
│                                         │
│       Deleting Your Account             │
│                                         │
│  Please wait while we securely remove   │
│  your account and all associated data...│
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ This process may take a few moments │ │  ← Blue info box
│ │ as we clean up all your data...     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Complete HTML Structure

**Location**: `AccountDeletionModal.vue` (lines 101-112)

```vue
<div v-if="step === 3" class="space-y-4 text-center">
  <!-- Loading Spinner -->
  <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div>
  
  <h4 class="text-lg font-semibold text-white">Deleting Your Account</h4>
  
  <p class="text-gray-300 text-sm">
    Please wait while we securely remove your account and all associated data...
  </p>
  
  <!-- Info Box -->
  <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
    <p class="text-blue-400 text-xs">
      This process may take a few moments as we clean up all your data across the system.
    </p>
  </div>
</div>
```

### Exact Text Content

#### Header
```
Deleting Your Account
```

#### Main Message
```
Please wait while we securely remove your account and all associated data...
```

#### Info Box Message
```
This process may take a few moments as we clean up all your data across the system.
```

### Spinner Styling

**Complete Styling**:
```css
animation: animate-spin          /* Rotating animation */
shape: rounded-full              /* Circular */
size: h-16 w-16                 /* 64px × 64px */
border: border-b-2              /* Bottom border only, 2px */
border-color: border-red-500    /* Red spinner */
margin: mx-auto                 /* Centered */
```

### Info Box Styling

**Complete Styling**:
```css
background: bg-blue-500/10      /* Blue with 10% opacity */
border: border-blue-500/20      /* Blue with 20% opacity */
border-radius: rounded-lg       /* 8px */
padding: p-3                    /* 12px */
text-color: text-blue-400       /* Blue-400 for text */
text-size: text-xs              /* 12px */
```

---

## Step 4: Success

### Visual Layout

```
┌─────────────────────────────────────────┐
│ Delete Account                      [X] │
├─────────────────────────────────────────┤
│                                         │
│              ✅  (checkmark)            │
│                                         │
│    Account Deleted Successfully         │
│                                         │
│  Your account and all associated data   │
│  have been permanently removed from     │
│  our system.                            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ You will be redirected to the       │ │  ← Green success box
│ │ sign-in page in a few seconds.      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Complete HTML Structure

**Location**: `AccountDeletionModal.vue` (lines 115-126)

```vue
<div v-if="step === 4" class="space-y-4 text-center">
  <!-- Success Icon -->
  <div class="text-green-500 text-6xl mb-4">✅</div>
  
  <h4 class="text-lg font-semibold text-white">Account Deleted Successfully</h4>
  
  <p class="text-gray-300 text-sm">
    Your account and all associated data have been permanently removed from our system.
  </p>
  
  <!-- Success Box -->
  <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
    <p class="text-green-400 text-xs">
      You will be redirected to the sign-in page in a few seconds.
    </p>
  </div>
</div>
```

### Exact Text Content

#### Header
```
Account Deleted Successfully
```

#### Main Message
```
Your account and all associated data have been permanently removed from our system.
```

#### Success Box Message
```
You will be redirected to the sign-in page in a few seconds.
```

### Success Box Styling

**Complete Styling**:
```css
background: bg-green-500/10     /* Green with 10% opacity */
border: border-green-500/20     /* Green with 20% opacity */
border-radius: rounded-lg       /* 8px */
padding: p-3                    /* 12px */
text-color: text-green-400      /* Green-400 for text */
text-size: text-xs              /* 12px */
```

### Behavior

- **No user interaction required**
- **Auto-redirect**: Handled by authStore after successful deletion
- **Modal cannot be closed** at this step
- User sees confirmation before being logged out

---

## Step 5: Error

### Visual Layout

```
┌─────────────────────────────────────────┐
│ Delete Account                      [X] │
├─────────────────────────────────────────┤
│                                         │
│              ❌  (error X)              │
│                                         │
│          Deletion Failed                │
│                                         │
│  We encountered an error while deleting │
│  your account. Please try again or      │
│  contact support.                       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Error: {error message}              │ │  ← Red error box
│ └─────────────────────────────────────┘ │
│                                         │
│ [     Close      ] [    Try Again     ] │
└─────────────────────────────────────────┘
```

### Complete HTML Structure

**Location**: `AccountDeletionModal.vue` (lines 129-154)

```vue
<div v-if="step === 5" class="space-y-4 text-center">
  <!-- Error Icon -->
  <div class="text-red-500 text-6xl mb-4">❌</div>
  
  <h4 class="text-lg font-semibold text-white">Deletion Failed</h4>
  
  <p class="text-gray-300 text-sm">
    We encountered an error while deleting your account. Please try again or contact support.
  </p>
  
  <!-- Error Box -->
  <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
    <p class="text-red-400 text-xs">
      Error: {{ errorMessage }}
    </p>
  </div>
  
  <!-- Buttons -->
  <div class="flex space-x-3">
    <button 
      @click="closeModal" 
      class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
    >
      Close
    </button>
    <button 
      @click="retryDeletion" 
      class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Try Again
    </button>
  </div>
</div>
```

### Exact Text Content

#### Header
```
Deletion Failed
```

#### Main Message
```
We encountered an error while deleting your account. Please try again or contact support.
```

#### Error Box Message
```
Error: {errorMessage}
```
- `errorMessage` is a dynamic variable from the component state

#### Button Text
- **Close Button**: "Close"
- **Retry Button**: "Try Again"

### Error Box Styling

**Complete Styling**:
```css
background: bg-red-500/10       /* Red with 10% opacity */
border: border-red-500/20       /* Red with 20% opacity */
border-radius: rounded-lg       /* 8px */
padding: p-3                    /* 12px */
text-color: text-red-400        /* Red-400 for text */
text-size: text-xs              /* 12px */
```

### Behavior

**Retry Action**:
- Button text: "Try Again"
- Action: `retryDeletion()` function
- Returns user to Step 2 (Type Confirmation)
- Clears error message

**Close Action**:
- Button text: "Close"
- Action: `closeModal()` function
- Closes modal completely
- Resets all state

---

## Component Integration

### Usage in Account Page

**Location**: `pages/account.vue` (lines 289-304)

```vue
<!-- Trigger Button -->
<button
  @click="showDeleteModal = true"
  class="w-full px-4 py-2 transition-colors font-medium text-white theme-button-danger"
>
  Delete My Account
</button>

<!-- Account Deletion Modal -->
<AccountDeletionModal 
  :show-modal="showDeleteModal"
  @close="showDeleteModal = false"
/>
```

### Component Props

**Location**: `AccountDeletionModal.vue` (lines 165-169)

```typescript
interface Props {
  showModal: boolean
}

const props = defineProps<Props>()
```

**Prop Details**:
- `showModal`: Boolean to control modal visibility

### Component Emits

**Location**: `AccountDeletionModal.vue` (lines 172-174)

```typescript
const emit = defineEmits<{
  close: []
}>()
```

**Emit Details**:
- `close`: Emitted when modal should be closed (no parameters)

### Component State

**Location**: `AccountDeletionModal.vue` (lines 180-183)

```typescript
const step = ref(1)                    // Current step (1-5)
const confirmationText = ref('')       // User's typed confirmation
const isDeleting = ref(false)         // Loading state during deletion
const errorMessage = ref('')          // Error message if deletion fails
```

### Key Methods

**Location**: `AccountDeletionModal.vue` (lines 193-238)

```typescript
// Progress through steps
const nextStep = () => {
  step.value = Math.min(step.value + 1, 4)
}

// Go back one step
const previousStep = () => {
  step.value = Math.max(step.value - 1, 1)
}

// Close modal and emit close event
const closeModal = () => {
  emit('close')
}

// Reset all state to initial values
const resetState = () => {
  step.value = 1
  confirmationText.value = ''
  isDeleting.value = false
  errorMessage.value = ''
}

// Execute account deletion
const confirmDeletion = async () => {
  if (confirmationText.value !== 'DELETE') return
  
  step.value = 3
  isDeleting.value = true
  
  try {
    const success = await authStore.deleteUserAccount()
    
    if (success) {
      step.value = 4
      // Account deletion successful - signOut will handle redirect automatically
    } else {
      throw new Error('Account deletion failed')
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Unknown error occurred'
    step.value = 5
  } finally {
    isDeleting.value = false
  }
}

// Retry deletion after error
const retryDeletion = () => {
  step.value = 2
  errorMessage.value = ''
}
```

### State Reset on Close

**Location**: `AccountDeletionModal.vue` (lines 186-190)

```typescript
// Watch for modal close to reset state
watch(() => props.showModal, (newValue) => {
  if (!newValue) {
    resetState()
  }
})
```

**Behavior**: When modal is closed, all state is reset to initial values so it's fresh when reopened.

---

## Complete Code Reference

### Modal Header (All Steps)

**Location**: `AccountDeletionModal.vue` (lines 6-17)

```vue
<div class="flex items-center justify-between mb-6">
  <h3 class="text-xl font-bold text-white">Delete Account</h3>
  <button 
    @click="closeModal" 
    class="text-gray-400 hover:text-white transition-colors"
    aria-label="Close delete account modal"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  </button>
</div>
```

**Styling**:
- Title: `text-xl font-bold text-white` (20px, bold, white)
- Close button: `text-gray-400 hover:text-white` (gray, white on hover)
- Close icon: 24px × 24px X icon (SVG)
- Layout: Flexbox with space-between
- Bottom margin: `mb-6` (24px)

### Complete Modal Container

**Location**: `AccountDeletionModal.vue` (lines 2-4)

```vue
<div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div class="bg-gray-900 rounded-xl max-w-md w-full">
    <div class="p-6">
```

**Structure**:
1. **Backdrop**: Fixed full-screen overlay with 50% black opacity
2. **Modal Container**: Gray-900 background, rounded corners, max 448px width
3. **Content Padding**: 24px padding around all content

---

## Implementation Checklist for Mobile

### Modal Structure
- [ ] Implement 5-step flow with state management
- [ ] Create full-screen backdrop with 50% black opacity
- [ ] Center modal container on screen
- [ ] Apply dark theme (gray-900 background)
- [ ] Add rounded corners (12px border radius)
- [ ] Set max width to 448px
- [ ] Implement modal header with close button

### Step 1: Initial Warning
- [ ] Display large warning emoji (⚠️, 96px font size)
- [ ] Show "Are you absolutely sure?" header
- [ ] Display exact warning text with bold "permanently delete"
- [ ] Create red warning box (red-500/10 background, red-500/20 border)
- [ ] List all 5 deletion items in red text
- [ ] Show "This action cannot be undone" text in bold
- [ ] Implement Cancel and "I Understand, Continue" buttons
- [ ] Style buttons: gray cancel, red continue

### Step 2: Type Confirmation
- [ ] Display trash emoji (🗑️, 96px font size)
- [ ] Show "Final Confirmation" header
- [ ] Display "Type DELETE" instruction with bold DELETE
- [ ] Create input field with black background
- [ ] Implement focus state (red ring)
- [ ] Show validation error for incorrect input
- [ ] Disable Delete button until "DELETE" is typed exactly
- [ ] Implement Back and "Delete My Account" buttons
- [ ] Show "Deleting..." state on button during operation

### Step 3: Deletion in Progress
- [ ] Display animated spinner (red, 64px circular)
- [ ] Show "Deleting Your Account" header
- [ ] Display progress message
- [ ] Create blue info box with process message
- [ ] Prevent modal close during deletion
- [ ] Handle async deletion operation

### Step 4: Success
- [ ] Display success checkmark emoji (✅, 96px font size)
- [ ] Show "Account Deleted Successfully" header
- [ ] Display confirmation message
- [ ] Create green success box with redirect notice
- [ ] Implement auto-redirect logic
- [ ] Prevent manual close

### Step 5: Error
- [ ] Display error X emoji (❌, 96px font size)
- [ ] Show "Deletion Failed" header
- [ ] Display error message to user
- [ ] Create red error box with dynamic error text
- [ ] Implement Close and "Try Again" buttons
- [ ] Wire up retry logic to return to Step 2

### Functionality
- [ ] Implement step progression logic
- [ ] Handle back navigation (Step 2 only)
- [ ] Implement modal close on backdrop click (optional)
- [ ] Reset all state when modal closes
- [ ] Validate "DELETE" text exactly (case-sensitive)
- [ ] Call account deletion API
- [ ] Handle API errors gracefully
- [ ] Redirect after successful deletion

### Styling
- [ ] Use dark theme consistently
- [ ] Apply proper spacing (space-y-4 between sections)
- [ ] Style all text with correct colors and sizes
- [ ] Implement button hover states
- [ ] Add disabled state styling for buttons
- [ ] Create colored info boxes (red, blue, green)
- [ ] Apply proper border radius to all elements
- [ ] Ensure responsive width on mobile

---

## Styling Quick Reference

### Color Classes Used

| Class | Usage |
|-------|-------|
| `bg-gray-900` | Modal background |
| `bg-black` | Input background |
| `bg-gray-600` | Cancel/back button |
| `bg-red-600` | Danger/delete button |
| `text-white` | Primary headers and button text |
| `text-gray-300` | Body text |
| `text-gray-400` | Muted text |
| `text-red-400` | Warning text |
| `text-red-500` | Warning icon, spinner |
| `text-blue-400` | Info text |
| `text-green-400` | Success text |
| `text-green-500` | Success icon |
| `bg-red-500/10` | Warning box background |
| `border-red-500/20` | Warning box border |
| `bg-blue-500/10` | Info box background |
| `bg-green-500/10` | Success box background |

### Spacing Classes Used

| Class | Value | Usage |
|-------|-------|-------|
| `space-y-4` | 16px vertical | Between content sections |
| `space-x-3` | 12px horizontal | Between buttons |
| `mb-6` | 24px | Header bottom margin |
| `mb-4` | 16px | Icon bottom margin |
| `mb-2` | 8px | Subheader bottom margin |
| `mt-1` | 4px | Error text top margin |
| `p-6` | 24px | Modal content padding |
| `p-4` | 16px | Warning box padding |
| `p-3` | 12px | Info/success box padding |
| `px-4 py-2` | 16px/8px | Button padding |
| `px-4 py-3` | 16px/12px | Input padding |

### Typography Classes Used

| Class | Value | Usage |
|-------|-------|-------|
| `text-6xl` | 96px | Emoji icons |
| `text-xl` | 20px | Modal title |
| `text-lg` | 18px | Step headers |
| `text-sm` | 14px | Body text, list items |
| `text-xs` | 12px | Helper text, box messages |
| `font-bold` | 700 | Modal title |
| `font-semibold` | 600 | Step headers |

---

## Testing Scenarios

### Test Case 1: Normal Deletion Flow
1. User clicks "Delete My Account" on Account page
2. Modal opens at Step 1 with warning
3. User clicks "I Understand, Continue"
4. Modal shows Step 2 with input field
5. User types "DELETE" exactly
6. User clicks "Delete My Account"
7. Modal shows Step 3 with spinner
8. API call succeeds
9. Modal shows Step 4 with success message
10. User is redirected to sign-in page

### Test Case 2: Cancel at Step 1
1. User opens modal
2. User sees warning
3. User clicks "Cancel"
4. Modal closes
5. Account is not deleted

### Test Case 3: Back from Step 2
1. User reaches Step 2
2. User clicks "Back"
3. Returns to Step 1
4. Can cancel or continue again

### Test Case 4: Wrong Confirmation Text
1. User reaches Step 2
2. User types "delete" (lowercase)
3. Validation error appears
4. Delete button stays disabled
5. User types "DELETE" (correct)
6. Error disappears, button enables

### Test Case 5: Deletion Error
1. User completes Steps 1-2
2. API call fails during Step 3
3. Modal shows Step 5 with error
4. User sees error message
5. User clicks "Try Again"
6. Returns to Step 2
7. Can retry deletion

### Test Case 6: Close Modal Mid-Flow
1. User opens modal
2. User reaches Step 2
3. User clicks X close button
4. Modal closes
5. Account is not deleted
6. Opening modal again shows Step 1

---

## Important Notes

### Theme Clarification
**The production web app uses DARK THEME styling**, not light theme:
- Modal background: `bg-gray-900` (dark gray)
- Text: White and light gray
- Inputs: Black background (`bg-black`)
- Overall aesthetic: Dark mode

### Confirmation Requirement
- User must type "DELETE" exactly (case-sensitive)
- Typing "delete", "Delete", or anything else will not work
- Validation error shows immediately if wrong text entered

### No Undo
- Once deletion starts (Step 3), it cannot be cancelled
- User cannot close modal during deletion
- Data is permanently removed

### Auto-Redirect
- After successful deletion (Step 4), user is automatically redirected
- Redirect is handled by the authStore after account deletion
- Modal stays visible briefly to show success message

### State Management
- Modal maintains internal step state
- State resets when modal closes
- Each opening of modal starts fresh at Step 1

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `components/AccountDeletionModal.vue`
- **Integration**: `pages/account.vue` (line 289)
- **Auth Store**: Handles actual deletion logic

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

