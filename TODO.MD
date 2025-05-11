# Code & Chaos Fitness Tracker

## To-Do List

### 1. Live Progress Ring Update Improvements

- Enable _real-time_ ProgressRing updates when sets are logged (not just when exercises are marked complete).
- Ensure updates occur without requiring a page refresh.

### 2. Reorganize Management Tools into Dedicated Settings View

- Move the following into a single "Settings" or "Management" section:

  - **Exercise Manager** (ExerciseFormPanel)
  - **Category Manager** (CategoryManager)
  - **Weekly Schedule Builder** (WeeklyScheduleBuilder)

- Add easy navigation back to the **Dashboard** or **Workout Log**.

### 3. Prepare for Scalable Data Management

- Plan transition from **LocalStorage** to a **Database-backed API**.

  - Consider IndexedDB as an interim offline-first solution.
  - Begin outlining a JSON structure or schema for syncing data.
  - Explore minimal backend options (e.g., Firebase, Supabase, Node/Express + SQLite).

---

_Logged on: \[20250511 17:49]_
