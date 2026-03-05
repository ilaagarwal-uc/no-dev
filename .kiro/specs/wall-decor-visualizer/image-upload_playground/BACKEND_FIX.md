# Backend Crash Fix

## Problem
Backend server was crashing on startup with error:
```
triggerUncaughtException
```

## Root Cause
The `generateAuthToken()` function signature was updated to require 2 parameters (`userId` and `phoneNumber`), but the `refresh_token.api.ts` file was still calling it with only 1 parameter.

## Fix Applied

### File: `wall-decor-visualizer/backend/src/data-service/application/auth/refresh_token.api.ts`

Updated the `refreshTokenHandler` function to:
1. Retrieve the user from database using `userId`
2. Extract the `phoneNumber` from the user record
3. Pass both `userId` and `phoneNumber` to `generateAuthToken()`

### File: `wall-decor-visualizer/backend/src/data-service/domain/auth/index.ts`

Added new helper function:
```typescript
export async function getUserById(userId: string): Promise<{ phoneNumber: string } | null>
```

This function retrieves a user by their ID and returns their phone number.

## Testing

TypeScript compilation now passes without errors:
```bash
npx tsc --noEmit
# No errors
```

## Next Steps

1. Start the backend server:
   ```bash
   cd wall-decor-visualizer/backend
   npm run dev
   ```

2. Verify server starts successfully and shows:
   ```
   Connected to MongoDB
   Server running on port 3000
   ```

3. Clear browser localStorage

4. Login again with phone number and OTP 2213

5. Upload page should now load successfully
