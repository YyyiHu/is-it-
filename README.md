# Is It? - Epigram Display App

A modern web application that displays thought-provoking epigrams with automatic rotation and user submission capabilities.

<img src="./frontend/public/yicat.jpg" alt="Is It? App" width="90">

## Features

- **Random Epigrams**: Discover new thought-provoking quotes each time
- **Auto-Reload**: Configure automatic epigram rotation (1-240 minutes)
- **User Accounts**: Create an account to save and manage your submissions
- **Submit Your Own**: Share your favorite quotes or original thoughts
- **Personal History**: Track and manage all your submissions
- **Mobile Friendly**: Works perfectly on desktop, tablet, and mobile

## Quick Start

### Using Docker

1. **Prerequisites**:

   - [Docker](https://www.docker.com/get-started)
   - [Docker Compose](https://docs.docker.com/compose/install/)

2. **Clone and Run**:

   ```bash
   # Clone the repository
   git clone <repository-url>
   cd is-it-

   # Create environment file
   cp .env.example .env
   # Edit .env with your preferred settings

   # Start the application
   docker-compose up --build
   ```

3. **Access the App**:
   - Frontend: http://localhost:5173
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## How to Use

### Without Account

- View random epigrams
- Manually refresh to see new epigrams
- Sign up to unlock all features

### With Account

- **Submit Epigrams**: Click the pencil icon to add your own epigrams
- **View History**: Click the history icon to see your submissions (ordered by last updated time)
  - Select any of your submissions to display it
  - Edit or delete your own epigrams
- **Settings**: Click the gear icon to configure auto-reload preferences (default: 5 minutes)
- **Refresh**: Click the refresh button to immediately load a new epigram

## Technology Stack

### Frontend

- **Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Pinia** for state management
- **TanStack Query** for efficient data fetching
- **Tailwind CSS** for styling

### Backend

- **FastAPI** (Python) for API endpoints
- **SQLModel** for database ORM
- **PostgreSQL** for data storage
- **JWT** for authentication

### DevOps

- **Docker** & **Docker Compose** for containerization

## Project Structure

The project follows a standard structure with a FastAPI backend and Vue.js frontend. The backend handles data storage in PostgreSQL and provides REST API endpoints, while the frontend delivers a responsive user interface with efficient state management and data fetching.

## API Endpoints

| Method | Endpoint                     | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| GET    | `/api/epigrams/random/batch` | Get multiple random epigrams  |
| POST   | `/api/epigrams`              | Create a new epigram          |
| GET    | `/api/epigrams/mine`         | Get user's submitted epigrams |
| PUT    | `/api/epigrams/{id}`         | Update an existing epigram    |
| DELETE | `/api/epigrams/{id}`         | Delete an epigram             |
| POST   | `/api/auth/register`         | Register a new user           |
| POST   | `/api/auth/login`            | Login and get access token    |
| POST   | `/api/auth/logout`           | Logout and clear session      |
| GET    | `/api/auth/me`               | Get current user info         |
| GET    | `/api/users/settings`        | Get user settings             |
| PUT    | `/api/users/settings`        | Update user settings          |
