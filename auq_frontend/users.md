# Users

## **1. Global vs. User Customization**

- **Admin (is_admin = true):**
  - Can access the admin panel.
  - Can see logs, manage global app config (what’s available to everyone), maybe see user stats, etc.
  - Can update the global config in the database (e.g., which features/indicators are available to all).

- **Regular users (is_admin = false):**
  - Can access a “Customize” or “Profile” section.
  - Can save their own preferences (e.g., which indicators/point features they want to see, UI preferences, etc.).
  - Their preferences are stored in a `user_config` table in the database, keyed by their user ID.

## **2. Database Structure Example**

- **Table: `app_config`** (one row, or a few for multi-tenant)
  - `id`
  - `enabled_features` (JSON)
  - `disabled_indicators` (JSON)
  - `updated_at`

- **Table: `user_config`**
  - `id`
  - `user_id` (foreign key to auth.users)
  - `custom_features` (JSON)
  - `custom_indicators` (JSON)
  - `other_prefs` (JSON)
  - `updated_at`

- **Table: `users`** (Supabase Auth)
  - `id`
  - `email`
  - `is_admin` (boolean, or use metadata)

## **3. App Logic**

- On login, fetch:
  - The global config (`app_config`)
  - The user’s config (`user_config` for their user ID)
- Merge/apply these configs to control what the user sees.
- When a user updates their preferences, update their `user_config` row.
- When an admin updates the global config, update `app_config`.


## **4. UI/UX**

- **Admin Tab:** Only visible if `user.is_admin === true`
- **Customize Tab:** Visible to all logged-in users (shows their preferences)
- **Profile Tab:** Shows user info, maybe password reset, etc.

---

## **5. Why is this a best practice?**

- **Scalable:** Works for 1 or 1,000,000 users.
- **Personalized:** Each user can have their own experience.
- **Centralized control:** Admins can set global defaults/limits.
- **Secure:** Only admins can access admin features.
- **Extensible:** Easy to add more user or global settings later.

---

## **How to implement this in Supabase/Next.js**

- Use Supabase Auth for user management.
- Use RLS (Row Level Security) to ensure users can only update their own `user_config`.
- Use Supabase client to read/write configs in your app.

---

## **Would you like code examples for:**
- Creating the `user_config` and `app_config` tables?
- Fetching/merging configs in your Next.js app?
- RLS policies for security?
- UI for user customization?








**All improvements are now implemented:**

---

### 1. **Global Data Source for Indicators**
- `MapContext` now exposes both `availableIndicatorDefinitions` and `availableIndicatorValues` (the definitions and the actual values with year, geo_id, etc).
- These are always loaded and updated together when city or granularity changes.

### 2. **/compare Uses the Same Data as Map and Info**
- `CompareView` now uses `availableIndicatorDefinitions` and `availableIndicatorValues` from context.
- When rendering indicators, it finds the value and year for the selected area from `availableIndicatorValues`—just like `district-info.tsx`.
- The indicator year will always be correct and never undefined, as long as the data is present.

### 3. **No API Calls Triggered by Area**
- All API calls are only triggered by city or granularity changes, never by area.
- Area is only used for lookup/filtering and URL navigation.

### 4. **Consistent, Cached Data Across All Views**
- All views (`/`, `/visualize`, `/compare`) use the same context/cached data for indicators and areas.

---

**You now have a robust, scalable, and consistent architecture for your app.**

If you want, you can also refactor `district-info.tsx` to use the same context data for even more consistency.
