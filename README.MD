# IT Inventory Management System

A modern web application for tracking and managing IT assets within an organization. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Dashboard with key metrics and recent activity
- Create, view, update, and delete inventory items
- Item categorization by department, status, and type
- QR code generation for physical asset tracking
- Activity logging for audit purposes
- Item notes for maintenance records and comments
- Responsive design with dark mode support

## Technology Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Additional**: QR code generation, rate limiting, responsive design

## Setup and Installation

### Prerequisites
- Node.js and npm installed
- MongoDB instance (local or Atlas)

### Backend Setup
1. Navigate to the backend directory
2. Install dependencies: `npm install`
3. Create `.env` file with appropriate environment variables
4. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Create `.env` file with API URL
4. Start the development server: `npm run dev`

## Environment Variables

### Backend (.env)
```
PORT=5555
MONGODB_URL=your_mongodb_connection_string
APP_BASE_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5555
```

## License

MIT