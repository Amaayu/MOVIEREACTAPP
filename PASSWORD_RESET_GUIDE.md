# 🔐 Password Reset Feature Guide

## ✅ Feature Status: Fully Implemented

The password reset (forgot password) feature is **already working** and uses the same email verification system.

## 🎯 How It Works

### User Flow:

```
1. User clicks "Forgot Password?" on login page
   ↓
2. User enters their email address
   ↓
3. System sends password reset email
   ↓
4. User clicks link in email
   ↓
5. User enters new password
   ↓
6. Password updated successfully
   ↓
7. User can login with new password
```

## 📍 Routes & Components

### Frontend Routes:
- **`/forgot-password`** - Request password reset page
- **`/reset-password?token=xxx`** - Reset password form page

### Backend API Endpoints:
- **`POST /api/auth/forgot-password`** - Request password reset
- **`POST /api/auth/reset-password/:token`** - Reset password with token

### Components:
- ✅ `src/components/ForgotPassword.jsx` - Request reset form
- ✅ `src/components/ResetPassword.jsx` - New password form
- ✅ `src/components/Login.jsx` - Has "Forgot Password?" link

## 🔧 Backend Implementation

### 1. Request Password Reset
**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists, a password reset email has been sent"
}
```

**Features:**
- ✅ Generates secure 32-byte random token
- ✅ Token expires in 1 hour
- ✅ Sends email with reset link
- ✅ Doesn't reveal if email exists (security)
- ✅ Continues even if email fails

### 2. Reset Password
**Endpoint:** `POST /api/auth/reset-password/:token`

**Request:**
```json
{
  "password": "newPassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

**Features:**
- ✅ Validates token and expiration
- ✅ Requires minimum 6 characters
- ✅ Hashes password with bcrypt
- ✅ Clears reset token after use
- ✅ Single-use tokens

## 📧 Email Template

The password reset email includes:
- 🎨 Professional HTML design
- 📱 Mobile-responsive layout
- 🔗 Clear "Reset Password" button
- ⏰ Expiration notice (1 hour)
- 🛡️ Security disclaimer
- 📝 Plain text fallback

### Email Content:
```
Subject: Reset Your Password

Hi [Name],

We received a request to reset your password. Click the button below to create a new password:

[Reset Password Button]

Or copy this link: https://your-app.vercel.app/reset-password?token=xxx

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.
```

## 🎨 Frontend Components

### 1. Forgot Password Page (`/forgot-password`)

**Features:**
- Email input field
- Submit button
- Success/error messages
- Link back to login
- Loading state

**User Experience:**
```jsx
- User enters email
- Clicks "Send Reset Link"
- Sees success message
- Checks email inbox
```

### 2. Reset Password Page (`/reset-password?token=xxx`)

**Features:**
- New password input
- Confirm password input
- Password validation
- Submit button
- Success/error messages
- Auto-redirect to login

**User Experience:**
```jsx
- User clicks link in email
- Enters new password
- Confirms password
- Clicks "Reset Password"
- Redirected to login
```

### 3. Login Page Link

**Location:** Below password field

```jsx
<Link to="/forgot-password">
  Forgot Password?
</Link>
```

## 🔒 Security Features

### 1. Token Security
- ✅ 32-byte cryptographically secure random tokens
- ✅ Stored hashed in database
- ✅ Single-use (deleted after reset)
- ✅ 1-hour expiration
- ✅ Cannot be reused

### 2. Privacy Protection
- ✅ Doesn't reveal if email exists
- ✅ Same response for existing/non-existing emails
- ✅ Prevents email enumeration attacks

### 3. Password Requirements
- ✅ Minimum 6 characters
- ✅ Hashed with bcrypt (10 rounds)
- ✅ Never sent in plain text
- ✅ Validated on both frontend and backend

### 4. Rate Limiting
- ✅ API rate limiting enabled
- ✅ Prevents brute force attacks
- ✅ Protects against spam

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Password Reset Flow                       │
└─────────────────────────────────────────────────────────────┘

User Action                 System Response
───────────                 ───────────────

1. Clicks "Forgot Password?"
                           → Shows /forgot-password page

2. Enters email address
                           → Validates email format

3. Clicks "Send Reset Link"
                           → POST /api/auth/forgot-password
                           → Finds user by email
                           → Generates reset token
                           → Saves token to database
                           → Sends reset email
                           → Shows success message

4. Checks email inbox
                           → Receives reset email

5. Clicks reset link
                           → Opens /reset-password?token=xxx
                           → Shows password form

6. Enters new password
                           → Validates password length

7. Confirms password
                           → Validates passwords match

8. Clicks "Reset Password"
                           → POST /api/auth/reset-password/:token
                           → Validates token
                           → Checks expiration
                           → Hashes new password
                           → Updates user password
                           → Clears reset token
                           → Shows success message

9. Redirected to login
                           → Can login with new password
```

## 🧪 Testing the Feature

### Manual Testing:

1. **Request Reset:**
   ```bash
   # Go to login page
   # Click "Forgot Password?"
   # Enter your email
   # Click "Send Reset Link"
   # Check email inbox
   ```

2. **Reset Password:**
   ```bash
   # Click link in email
   # Enter new password
   # Confirm password
   # Click "Reset Password"
   # Login with new password
   ```

### API Testing:

```bash
# 1. Request password reset
curl -X POST https://your-backend.vercel.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# 2. Reset password (use token from email)
curl -X POST https://your-backend.vercel.app/api/auth/reset-password/TOKEN_HERE \
  -H "Content-Type: application/json" \
  -d '{"password":"newPassword123"}'
```

## ⚙️ Configuration

### Environment Variables Required:

```env
# SMTP Configuration (same as email verification)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM_NAME=MovieHub
SMTP_FROM_EMAIL=your-email@example.com

# Frontend URL (for reset links)
FRONTEND_URL=https://your-app.vercel.app
```

## 🐛 Troubleshooting

### Email Not Received:

1. ✅ Check spam/junk folder
2. ✅ Verify SMTP credentials
3. ✅ Check backend logs for errors
4. ✅ Verify email address is correct
5. ✅ Try requesting again

### Invalid Token Error:

1. ✅ Token expired (1 hour limit)
2. ✅ Token already used
3. ✅ Request new reset email
4. ✅ Check URL is complete

### Password Not Updating:

1. ✅ Check password meets requirements (6+ chars)
2. ✅ Verify passwords match
3. ✅ Check backend logs
4. ✅ Try requesting new reset

## 📝 Error Messages

### User-Friendly Messages:

| Scenario | Message |
|----------|---------|
| Email sent | "If an account exists, a password reset email has been sent" |
| Invalid token | "Invalid or expired reset token" |
| Password too short | "Password must be at least 6 characters" |
| Passwords don't match | "Passwords do not match" |
| Success | "Password reset successfully" |

## 🎯 Best Practices

1. ✅ **Short expiration** - 1 hour for security
2. ✅ **Single-use tokens** - Cannot be reused
3. ✅ **Privacy protection** - Doesn't reveal if email exists
4. ✅ **Clear messaging** - User knows what to do
5. ✅ **Mobile-friendly** - Works on all devices
6. ✅ **Graceful errors** - Helpful error messages

## 📊 Summary

| Feature | Status | Details |
|---------|--------|---------|
| Request Reset | ✅ Working | Email sent with reset link |
| Reset Password | ✅ Working | Token validated, password updated |
| Email Template | ✅ Working | Professional HTML design |
| Frontend Pages | ✅ Working | ForgotPassword & ResetPassword |
| Login Link | ✅ Working | "Forgot Password?" link added |
| Security | ✅ Working | Secure tokens, hashed passwords |
| Rate Limiting | ✅ Working | API rate limiting enabled |

## 🎉 Ready to Use!

The password reset feature is **fully implemented and working**. Users can:

1. Click "Forgot Password?" on login page
2. Enter their email
3. Receive reset link via email
4. Set new password
5. Login with new password

All using the same email verification system! 🚀
