# Testing Guide

## Overview

This project uses Vitest for frontend testing and Jest for backend testing. The test suite covers the authentication flow.

## Frontend Tests

### Setup

Install dependencies:
```bash
npm install
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Files

- `src/components/__tests__/Register.test.jsx` - Registration component tests
- `src/components/__tests__/Login.test.jsx` - Login component tests
- `src/store/__tests__/authSlice.test.js` - Redux auth slice tests

### Test Coverage

The tests cover:
- ✅ User registration flow
- ✅ Password validation
- ✅ User login
- ✅ Redux state management
- ✅ Error handling

## Backend Tests

### Setup

```bash
cd backend
npm install --save-dev jest supertest
```

### Running Backend Tests

```bash
cd backend
npm test
```

### Test Files

- `backend/routes/__tests__/authRoutes.test.js` - Authentication API endpoint tests

### Backend Test Coverage

- ✅ User registration endpoint
- ✅ Login endpoint
- ✅ Token validation
- ✅ Error responses

## Key Test Scenarios

### 1. Registration Flow
- User fills registration form
- Passwords must match
- User is logged in immediately
- User is redirected to home page

### 2. Login Flow
- User enters credentials
- Backend validates credentials
- Returns token and user data
- User is logged in and redirected to home

## Environment Variables

Make sure these are set:

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

### Backend (backend/.env)
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3000
JAMENDO_CLIENT_ID=your_jamendo_client_id
```

## Troubleshooting

### Tests failing?
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Check that all dependencies are installed
3. Make sure MongoDB is running for backend tests

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run Frontend Tests
  run: npm test

- name: Run Backend Tests
  run: cd backend && npm test
```
