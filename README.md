# CEVEC Timesheet Logger

CEVEC Timesheet Logger is a modern, feature-rich web application designed to help users efficiently track their daily work, manage tasks, and plan for upcoming activities. It integrates AI-powered suggestions to assist with planning and provides a clear overview of logged time and holidays.

## Key Features

*   **Comprehensive Daily Logging:** Log your daily tasks including what you planned, what you actually accomplished, any issues encountered, and your plan for the next day.
*   **Interactive Calendar View:** Visualize your logged days, total working days in the month, and days that still require timesheet entries.
*   **Vietnam Public Holiday Integration:** Automatically displays public holidays for Vietnam directly on the calendar.
*   **AI-Powered Planning Assistance:** Leverages Genkit and Google AI to provide intelligent suggestions for "Tomorrow's Plan," with a focus on UI/UX related tasks.
*   **CSV Data Export:** Easily export your timesheet data to a CSV file for reporting or archiving.
*   **Monthly Statistics:** Get a quick overview of your logged days versus the total working days for the current month.
*   **Dark Mode Support:** Switch between light and dark themes for comfortable viewing.

## Technology Stack

*   **Frontend:** Next.js (v15+ with Turbopack), React, TypeScript
*   **UI Components:** Radix UI (for accessible components like Dialogs, Popovers, etc.)
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide Icons
*   **Forms & Validation:** React Hook Form, Zod
*   **AI Integration:** Genkit (with `@genkit-ai/googleai` for Google AI models)
*   **Backend API:** Next.js API Routes
*   **Database:** PostgreSQL
*   **ORM:** Kysely (for type-safe SQL query building)
*   **Date Utilities:** date-fns

## Getting Started

Follow these steps to get the CEVEC Timesheet Logger running on your local machine.

### Prerequisites

*   Node.js (v20 or later recommended)
*   npm (v10 or later) or yarn
*   PostgreSQL server running

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd cevec-timesheet-logger 
    ```
    *(Replace `<repository-url>` with the actual URL of this repository)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env.local
        ```
    *   Update `.env.local` with your local PostgreSQL database connection details and any other required API keys or configurations (e.g., for Genkit/Google AI).
        *   `POSTGRES_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"`
        *   `DEFAULT_USER_EMAIL="your.email@example.com"` (for default user in timesheet)

4.  **Run database migrations:**
    This will set up the necessary tables in your PostgreSQL database.
    ```bash
    npm run migrate
    ```

5.  **(Optional) Seed the database:**
    To populate the database with initial sample data:
    ```bash
    npm run db:seed
    ```

6.  **Generate Kysely database types (if you change the schema):**
    ```bash
    npm run db:generate-types
    ```

### Running the Application

1.  **Start the Next.js development server:**
    This will run the main application, typically on `http://localhost:9002`.
    ```bash
    npm run dev
    ```

2.  **Start the Genkit development server (for AI features):**
    This runs the Genkit AI flows, typically on `http://localhost:4000` (Genkit UI) and makes flows available to the Next.js app.
    ```bash
    npm run genkit:dev
    ```
    Or, to watch for changes in AI flow files:
    ```bash
    npm run genkit:watch
    ```

## Available Scripts

Here are some of the key scripts available in `package.json`:

*   `npm run dev`: Starts the Next.js development server with Turbopack.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the codebase using Next.js's ESLint configuration.
*   `npm run typecheck`: Runs TypeScript to check for type errors.
*   `npm run migrate`: Applies database migrations using Kysely.
*   `npm run db:seed`: Seeds the database with initial data.
*   `npm run db:generate-types`: Generates TypeScript types from your Kysely database schema.
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with file watching.
