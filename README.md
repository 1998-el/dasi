# DASI - Data Spatial Intelligence

DASI is a comprehensive educational platform for managing students, courses, attendance, and more.

## Features

- **Student Management**: Add, update, and view student information
- **Course Management**: Create and manage courses
- **Attendance Tracking**: Record and view student attendance
- **Payment Management**: Handle registration fees and tuition payments
- **Timetable**: View weekly class schedules
- **Dashboard**: Overview of key statistics and recent activities

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React Context API (planned)
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

Builds the application for production to the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── layout/       # Layout components (header, sidebar, etc.)
│   ├── ui/           # Reusable UI components
│   └── sections/     # Page sections
├── pages/            # Page components
├── types/            # TypeScript type definitions
├── styles/           # Global styles
└── utils/            # Utility functions
```

## License

MIT
