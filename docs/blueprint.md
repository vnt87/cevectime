# **App Name**: TimeSage

## Core Features:

- Monthly Calendar View: Display a monthly calendar with visual indicators for logged dates, unlogged dates, and the current date. Weekends and holidays are visually distinct and disabled for logging.
- Timesheet Logging Modal: Open a side modal form via a 'Log Timesheet' button. The modal includes fields for Date (Date Range Picker, defaulting to today), Logged Time (Number Input, defaulting to 8), User (Text Input, defaulting to vu.nam@sun-asterisk.com), Project (Dropdown with options), and text areas for report sections.
- Data Logging: Create separate entries for each day in the selected date range using the values from the timesheet logging modal, when the form is submitted.
- CSV Export: Enable exporting logged timesheet data as a CSV file. The CSV file includes columns for Date, Logged Time, User, Project, Today plan, Actual work, Issues, Tomorrow Plan, Free comments.
- AI-Powered Suggestions: Use AI to provide suggested comments based on what a user inputs in the fields 'Today plan','Actual work','Issues' to fill the 'Tomorrow Plan'. The AI should only inject ideas where there is room for improvement and when information may be missing, acting as a 'tool' to prevent things from being forgotten or overlooked.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to evoke a sense of professionalism and reliability, without being dull. Inspired by the focus required in Time Tracking.
- Background color: Very light Lavender (#F0F2FA), the background provides a soft, muted backdrop that ensures comfortable readability.
- Accent color: Electric Blue (#7DF9FF) to highlight interactive elements and key actions, creating a clear visual hierarchy.
- Clean and modern sans-serif fonts for all text elements.
- Simple and clear icons to represent actions and data types.
- A clean, card-based layout to provide well-defined sections.
- Use subtle transitions to indicate changes.