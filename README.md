# Fitness Tracker

A simple, fully offline fitness tracker built with React and Tailwind CSS.  
Log exercises, track progress by day, and build your exercise library — all stored in your browser's LocalStorage.

## DEMO

[Demo](https://brascomarketing.github.io/Kevin-s-React-App-Tracker/)

## Features

- Manage your own Exercise Library (Add, Rename, Reorder, Delete)
- Categorize exercises by default loaded Push, Pull, and Legs categories
- OR Create your own custom categories and assign exercises to one or many categories
- Choose which day of the week the category will use (Everyday defaults to "Rest" day)
- Log sets with reps and weight for any day
- Designate exercises as 'body weight' and the "Weight" input will prepopulate
- Mark exercises as completed (with commit-style confirmation)
- Navigate forward or backward through days to review or add logs
- All data stored locally in your browser's LocalStorage (no account required)
- Dark Mode Only UI (because light mode is banned here)
- Easily Backup/Restore all of your data (exercises, workout history, categories, EVERYTHING!)

## Components

### CalendarPanel

Displays status of past workouts with the ability to load that day's stats into the main view

### CategoryManager

Allows the creation of custom categories. Created categories can be renamed and or deleted. App preloads with 'Push', 'Pull', 'Legs', and 'Freestyle' if no categories exist in the user's LocalStorage

### CategorySwitch

Component used in the Edit Exercise component to enable/disable categories on a per/exercises basis through the use of toggle switches.

### DailyProgressRing

Calculates and displays a progress chart (Donut) based on the total number of exercises for the day (estimating 3 sets each unless overridden in the exercises settings)

### DayView

Main view of the app displaying the exercises of the day and their completion status

### ExerciseEditModal

Popup window that allows renaming an exercise, setting the category/categories it appears, turning on/off the Body Weight mechanism.

### ExerciseFormPanel

Add exercises in this component. Fields for name, category, target number of sets, and Use Bodyweight?

### ExerciseLibraryColumns

All stored categories will appear in this component along with the editable exercises assigned to each

### UserProfileModal

Modal to enter body weight for calculation and prepopulation for body weight exercises

### VolumeChart

Line chart displaying the accumulated Volume (reps x weight) over the course of a week, month, or all time. Also displays the total

### WeeklyScheduleBuilder

A component displaying every day of the week, allowing the user to assign what category of exercises should be done on that day.

### WorkoutTypeVolumeChart

Displays a progress chart based on the current day's exercise type for a better gauge of progress that the Total Volume Chart doesn't provide.

## Built With

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) (Drag and Drop library)
- [@heroicons.com/](https://heroicons.com/)

## Coming Soon

- History Log
- Streak Tracker
- Progressive Overload Notification
- AI Integration
- Scalable Data Management
- App store versions
