# Mobile Member HUD Design (Owner Role)

## Overview
A mobile-optimized administration interface for the `/member` page, accessible exclusively by users with the `owner` role. The design focuses on replacing the wide, desktop-centric data table with a mobile-native "Operative Dossier" card layout. It also implements crucial scalability features (Virtualization, Infinite Scroll, and Server-Side Search) to handle a large and growing user base smoothly on mobile devices.

## 1. Architecture & Data Flow
- **Data Source:** Existing `/api/member/users` endpoint.
- **Enhancement Needed on Backend:** The API currently returns all users at once (`select * from users`). It must be updated to support:
  - `limit` and `offset` for pagination / infinite scroll.
  - `search` query parameter (filtering by username or telegram_name).
  - `filter` query parameter (by status or role).
- **Frontend State:** 
  - `users`: Array of loaded users.
  - `page`: Current offset/page.
  - `hasMore`: Boolean flag indicating if more records exist.
  - `searchQuery` & `activeFilter`: String states triggering re-fetches.

## 2. Component Structure

### 2.1 Header & Metrics (Fixed Top)
- **Top Bar:** "◀ BACK" button (routes to `/monitor`), Page Title ("Member Control"), and the current Owner's badge.
- **Scrollable Metrics Bar:** Horizontal scroll container showing total numbers (Total Users, Active, Suspended).
- **Search & Filter Bar:**
  - An input field for text search.
  - Filter toggle buttons (All, Owners, Suspended).

### 2.2 Dossier Card List (Virtualization + Infinite Scroll)
- **Virtual List Container:** Utilizes a virtualization library (e.g., `react-virtualized` or a custom IntersectionObserver approach if lightweight is preferred) to render only the visible cards in the DOM.
- **Intersection Trigger:** A transparent `div` at the bottom of the list triggers the next page fetch when it enters the viewport.

### 2.3 User Card (The Operative Dossier)
- **Collapsed State (Default):**
  - Left: User ID, Username (bold), Role badge.
  - Right: Status dot (pulsing green for Active, static red for Suspended), XP value.
- **Expanded State (On Tap):**
  - Slides down to reveal additional details: Telegram handle, Last Login date.
  - **Action Bar:** Buttons for CRUD operations:
    - Change Role (Toggle between Owner/Member)
    - Suspend / Activate (Toggle)
    - Delete (Red button with double-confirmation prompt)
- **Feedback:** Toast notifications (already present in the page) will provide success/error feedback for actions.

## 3. Error Handling & Edge Cases
- **Empty State:** If a search yields no results, display a thematic "NO OPERATIVES FOUND" message.
- **Loading State:** Initial load displays a skeleton card layout. Subsequent page loads display a small loading spinner at the bottom of the list.
- **Action Failures:** If a CRUD action fails (e.g., network error), revert the optimistic UI update and show a toast error message.
- **Self-Editing Protection:** Ensure the UI prevents the logged-in owner from accidentally deleting themselves or demoting themselves to a member.

## 4. Testing & Verification
- **Responsiveness:** Verify cards render correctly on iPhone SE width (320px) up to Pro Max width (430px).
- **Performance:** Verify DOM node count stays constant (via dev tools) while scrolling through a mocked list of 500 users.
- **Backend Sync:** Verify changes to a user's role immediately reflect in the UI without a full page refresh.

## 5. Scope Limit
This design strictly covers the `owner` view of the `/member` page. A separate user settings/profile interface for the `member` role will be handled in a distinct future specification.
