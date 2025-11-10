# Email Verification Behavior

## ✅ Current Setup

Email verification is **optional and non-blocking**. Users can use the app immediately after registration.

## 📧 When Emails Are Sent

### 1. Registration (One Time Only)
- ✅ Verification email sent **automatically** when user creates account
- ✅ Sent **only once** during registration
- ✅ User can login and use app immediately (doesn't need to verify first)
- ✅ If email fails to send, registration still succeeds

### 2. Manual Resend (User Initiated)
- ✅ User can click "Resend Email" button in the banner
- ✅ Only available if email is **not yet verified**
- ✅ Rate limited: Must wait 2 minutes between resend requests
- ✅ Generates new verification token

### 3. Password Reset (User Initiated)
- ✅ User clicks "Forgot Password" link
- ✅ Enters email address
- ✅ Reset email sent if account exists

## 🚫 When Emails Are NOT Sent

- ❌ **Login** - No email sent on login
- ❌ **Profile updates** - No email sent when updating profile
- ❌ **Subsequent logins** - No verification reminders
- ❌ **Already verified** - No emails if already verified
- ❌ **Automatic resends** - No automatic email resending

## 🎯 User Flow

### New User Registration:
```
1. User fills registration form
2. Account created in database
3. Verification email sent (one time)
4. User receives JWT token
5. User can login and use app immediately
6. Banner shows "Please verify your email"
7. User clicks link in email → Email verified
8. Banner disappears
```

### If User Doesn't Receive Email:
```
1. User sees verification banner
2. User clicks "Resend Email" button
3. New verification email sent
4. User clicks link → Email verified
```

### Login (Existing User):
```
1. User enters credentials
2. User logs in successfully
3. No email sent
4. If not verified, banner shows
5. If verified, no banner
```

## 🔒 Security Features

1. **Rate Limiting:**
   - 2-minute cooldown between resend requests
   - Prevents email spam

2. **Token Expiration:**
   - Verification tokens expire after 24 hours
   - Password reset tokens expire after 1 hour

3. **Single Use:**
   - Tokens are deleted after successful verification
   - Cannot be reused

4. **No Spam:**
   - Email only sent once during registration
   - Resend only if user manually requests it
   - No automatic reminders

## 📊 Email Sending Summary

| Action | Email Sent? | Frequency | Required? |
|--------|-------------|-----------|-----------|
| Registration | ✅ Yes | Once | No (optional) |
| Login | ❌ No | Never | N/A |
| Resend Request | ✅ Yes | On demand | No (optional) |
| Password Reset | ✅ Yes | On demand | Yes (for reset) |
| Profile Update | ❌ No | Never | N/A |
| Already Verified | ❌ No | Never | N/A |

## 🎨 User Experience

### Unverified User:
- ✅ Can login and use all features
- ✅ Sees non-intrusive banner at top
- ✅ Can dismiss banner temporarily
- ✅ Can resend email if needed
- ✅ No blocking or restrictions

### Verified User:
- ✅ No banner shown
- ✅ Full access to all features
- ✅ No email reminders

## 🔧 Configuration

### Environment Variables:
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM_NAME=MovieHub
SMTP_FROM_EMAIL=your-email@example.com
FRONTEND_URL=https://your-app.vercel.app
```

### Rate Limiting:
- Resend cooldown: 2 minutes
- Verification token expiry: 24 hours
- Password reset token expiry: 1 hour

## 💡 Best Practices

1. **Non-Blocking:** Users can use app without verification
2. **One-Time Send:** Email sent only once during registration
3. **User Control:** User decides when to resend
4. **Clear Messaging:** Banner explains what to do
5. **Graceful Failure:** App works even if email fails

## 🐛 Troubleshooting

### Email Not Received:
1. Check spam/junk folder
2. Click "Resend Email" button
3. Wait 2 minutes if recently sent
4. Check SMTP credentials in backend

### Banner Not Disappearing:
1. Click verification link in email
2. Refresh page after verification
3. Check browser console for errors

### Cannot Resend:
1. Wait 2 minutes between requests
2. Check if already verified
3. Check backend logs for errors

## 📝 Notes

- Email verification is **optional** - users can use app without it
- Verification email sent **only once** during registration
- No automatic reminders or resends
- User has full control over resending
- Rate limiting prevents spam
- Graceful error handling if email fails
