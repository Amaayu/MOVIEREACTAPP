# Testing Guide

## Overview

This project uses Vitest for frontend testing and Jest for backend testing. The test suite covers the email verification authentication flow.

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
- `src/components/__tests__/VerifyEmail.test.jsx` - Email verification component tests
- `src/components/__tests__/VerifyEmailPending.test.jsx` - Verification pending page tests
- `src/store/__tests__/authSlice.test.js` - Redux auth slice tests

### Test Coverage

The tests cover:
- ✅ User registration flow
- ✅ Password validation
- ✅ Email verification requirement
- ✅ Login with verified email
- ✅ Login rejection for unverified email
- ✅ Verification token validation
- ✅ Resend verification email
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
- ✅ Login endpoint with email verification check
- ✅ Email verification endpoint
- ✅ Token validation
- ✅ Error responses

## Key Test Scenarios

### 1. Registration Flow
- User fills registration form
- Passwords must match
- User is NOT logged in immediately
- User is redirected to "Verify Email Pending" page
- Verification email is sent

### 2. Email Verification
- User clicks link in email
- Token is validated
- Email is marked as verified
- User is redirected to login

### 3. Login Flow
- User enters credentials
- Backend checks if email is verified
- If NOT verified: Returns 403 error
- If verified: Returns token and user data
- User is logged in and redirected to home

### 4. Resend Verification
- User can request new verification email
- Rate limiting prevents spam
- New token is generated

## Fixing the 404 Error

The 404 error you're experiencing is because:

1. **Frontend dev server needs restart** - After adding new routes, restart with:
   ```bash
   npm run dev
   ```

2. **Old verification links** - Links sent before the fix have double slashes (`//verify-email`). Either:
   - Register again to get a new link
   - Manually remove the extra slash from the URL

3. **Vercel deployment** - The `vercel.json` has been updated to properly handle SPA routing

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
FRONTEND_URL=http://localhost:5173
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM_EMAIL=your_email
```

## Troubleshooting

### Tests failing?
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Check that all dependencies are installed
3. Make sure MongoDB is running for backend tests

### 404 on /verify-email?
1. Restart frontend dev server: `npm run dev`
2. Check that App.jsx includes the route
3. Use a fresh verification link (register again)

### Email not sending?
1. Check SMTP credentials in backend/.env
2. Check backend console for email errors
3. Verification is optional - users can still complete registration

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run Frontend Tests
  run: npm test

- name: Run Backend Tests
  run: cd backend && npm test
```
