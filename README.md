# Sydney Events Backend

A Node.js backend application that scrapes events from Concrete Playground Sydney, stores them in MongoDB, and provides real-time updates via Socket.IO.

## Features

- Scrape events from Concrete Playground Sydney
- Store events in MongoDB
- Real-time updates with Socket.IO
- RESTful API endpoints
- Email registration for events

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Ensure MongoDB is running at mongodb://localhost:27017/

## Usage

Start the server:
```
npm start
```

For development with auto-restart:
```
npm run dev
```

## API Endpoints

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get a single event by ID
- `POST /api/email` - Register an email for an event
- `POST /api/scrape` - Manually trigger a scrape and update of events

## Environment Variables

The application uses the following environment variables:

- `PORT` - Port to run the server on (default: 3000)
- `NODE_ENV` - Environment mode ('development' or 'production')

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- Cheerio for web scraping
- Axios for HTTP requests
- node-cron for scheduling
- Winston for logging