# Library Management System - Frontend

A modern web application built with Angular for managing library resources, book reservations, and user interactions.

## Features

- User authentication and profile management
- Book browsing and search functionality
- Book reservation system
- Personalized book recommendations
- Book cover image display
- Responsive and modern UI design
- Admin dashboard for library management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Angular CLI (v14.2.13)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd books-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Environment Setup

1. Configure the environment variables in `src/environments/environment.ts` for development:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api'
   };
   ```

## Available Scripts

- `ng serve` - Starts the development server at `http://localhost:4200/`
- `ng build` - Builds the project. Build artifacts will be stored in the `dist/` directory
- `ng test` - Executes unit tests via Karma
- `ng generate component component-name` - Generates a new component

## Project Structure

```
src/
  app/
    components/    # Reusable UI components
    services/      # API and state management services
    models/        # TypeScript interfaces and types
    guards/        # Route guards for authentication
    pages/         # Main application pages/routes
    shared/        # Shared utilities and components
  assets/         # Static files (images, icons)
  environments/   # Environment configuration files
```

## Development Guidelines

### Code Style

- Follow Angular style guide
- Use TypeScript features for type safety
- Implement lazy loading for better performance
- Write unit tests for components and services

### Component Creation

```bash
ng generate component components/new-component
```

### Service Creation

```bash
ng generate service services/new-service
```

## API Integration

The frontend communicates with the backend API using Angular's HttpClient. All API calls are centralized in service classes under the `services` directory.

## Authentication

JWT-based authentication is implemented using HTTP interceptors and route guards.

## Building for Production

1. Update production environment variables in `environment.prod.ts`
2. Run production build:
   ```bash
   ng build --prod
   ```
3. Deploy the contents of the `dist` folder to your hosting service

## Further Help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Support

For support and questions, please open an issue in the repository.

## License

MIT License
