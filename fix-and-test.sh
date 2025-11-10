#!/bin/bash

echo "🔧 MovieHub - Fix and Test Script"
echo "=================================="
echo ""

# Check if frontend dev server is running
echo "📋 Checking frontend dev server..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Frontend dev server is running on port 5173"
    echo "   Please restart it manually: npm run dev"
else
    echo "✅ Port 5173 is available"
fi

echo ""

# Check if backend server is running
echo "📋 Checking backend server..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend server is running on port 3000"
else
    echo "⚠️  Backend server is NOT running"
    echo "   Start it with: cd backend && npm run dev"
fi

echo ""
echo "🧪 Running tests..."
echo ""

# Install test dependencies if needed
if ! npm list vitest >/dev/null 2>&1; then
    echo "📦 Installing test dependencies..."
    npm install --save-dev vitest@^1.0.4 @vitest/ui@^1.0.4 jsdom@^23.0.1 @testing-library/react@^14.1.2 @testing-library/jest-dom@^6.1.5 @testing-library/user-event@^14.5.1
fi

# Run tests
npm test

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Restart your frontend dev server: npm run dev"
echo "2. Register a new user to get a fresh verification email"
echo "3. Click the verification link in your email"
echo "4. Login with your verified account"
echo ""
echo "📚 See TESTING.md for more information"
