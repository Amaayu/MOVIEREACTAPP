# MovieHub - Movie & TV Show Discovery App

A modern, full-stack movie and TV show discovery application built with React, Express, and MongoDB.

## Features

- 🎬 Browse trending movies and TV shows
- 🔍 Search across movies, TV shows, and people
- ⭐ View detailed information and ratings
- 🔖 Bookmark your favorite content
- ❤️ Like and save items to your collection
- 🔐 User authentication with JWT
- 📱 Progressive Web App (PWA) support
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

### Frontend
- React 19
- Redux Toolkit (State Management)
- React Router (Navigation)
- Tailwind CSS (Styling)
- Axios (API calls)
- Vite (Build tool)
- PWA Support

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- bcrypt (Password hashing)

### APIs
- TMDB API (Movie data)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- TMDB API key

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd MOVIEREACTAPP
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Configure environment variables**

Create `.env` in the root directory:
```env
VITE_API_URL=http://localhost:3000/api
```

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=3000
```

5. **Update TMDB API key**

Edit `src/utils/axios.jsx` and add your TMDB API Bearer token.

### Running the Application

1. **Start the backend server**
```bash
cd backend
npm run dev
```

2. **Start the frontend (in a new terminal)**
```bash
npm run dev
```

3. **Open your browser**
```
http://localhost:5173
```

## Building for Production

### Frontend
```bash
npm run build
```

### Backend
The backend runs as-is in production. Make sure to:
- Set `NODE_ENV=production`
- Use a production MongoDB URI
- Use a strong JWT secret

## Project Structure

```
MOVIEREACTAPP/
├── backend/
│   ├── config/         # Database configuration
│   ├── models/         # MongoDB models
│   └── server.js       # Express server
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   ├── store/          # Redux store
│   └── utils/          # Utility functions
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks/:id/:type` - Remove bookmark

### Likes
- `GET /api/likes` - Get user likes
- `POST /api/likes` - Add like
- `DELETE /api/likes/:id/:type` - Remove like

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend (Vercel/Railway/Render)
1. Deploy the `backend` folder
2. Set environment variables
3. Update frontend `VITE_API_URL` to production backend URL

## License

MIT

## Author

Your Name
