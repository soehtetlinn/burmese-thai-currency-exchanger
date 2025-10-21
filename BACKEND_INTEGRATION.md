# Backend Integration for Currency Exchanger

## Overview
The currency exchanger application has been fully integrated with the backend server at `https://www.shltechent.com/api`. This ensures that exchange rate updates are synchronized across all browsers and devices in real-time.

## Changes Made

### 1. Backend Server Changes (`/root/shltechent/sonesoebid_server/src/index.js`)

#### Modified `/api/admin/fx/parse` endpoint (Line 1227)
- Added support for `x-currex-admin-key` header authentication
- Allows currency exchanger frontend to save rates without full JWT authentication
- Falls back to JWT authentication if admin key is not provided
- Admin key: `CURREX_ADMIN_KEY=currex-admin-123` (configured in `.env`)

#### Modified `/api/admin/fx` endpoint (Line 1265)
- Added support for `x-currex-admin-key` header authentication
- Allows fetching rate history with admin key or JWT token

#### Modified `/api/fx/latest` endpoint (Line 1296)
- Updated to return complete rate data including all fields
- Public endpoint (no authentication required)
- Returns full exchange rate details for frontend compatibility

### 2. Frontend Changes

#### New File: `services/apiService.ts`
- **Purpose**: Central API service for backend communication
- **Functions**:
  - `fetchLatestRate()`: Fetches the latest exchange rate from backend
  - `fetchRateHistory()`: Fetches historical rates
  - `saveRateToBackend()`: Saves new rates to backend
  - `backendToFrontend()`: Converts backend format to frontend format
  - `frontendToBackend()`: Converts frontend format to backend text format

#### Updated: `hooks/useCurrencyRates.tsx`
- **Added Features**:
  - Automatic backend data fetching on mount
  - Polling every 30 seconds for new rates
  - `refreshFromBackend()` function for manual refresh
  - Seamless synchronization between localStorage and backend
  - Background polling doesn't show errors to users

- **Key Changes**:
  - Added `useEffect` hook for initial data fetch
  - Added polling interval (30 seconds)
  - Added `lastFetchedIdRef` to prevent duplicate updates
  - Maintains localStorage as fallback/cache

#### Updated: `pages/AdminPage.tsx`
- **Changes**:
  - Added `saveRateToBackend()` call before local update
  - Continues to work even if backend save fails (graceful degradation)
  - Clears textarea after successful submission
  - Updated import to include `saveRateToBackend`

#### Updated: `pages/HomePage.tsx`
- **Added Features**:
  - Manual refresh button with loading indicator
  - "Auto-updates every 30 seconds" notification
  - Spinning animation during refresh
  - Disabled state while refreshing

#### Updated: `components/Header.tsx`
- **Changes**:
  - Made logo and text responsive
  - Hides text on mobile screens (narrow ratios)
  - Shows only logo on mobile, logo + text on desktop
  - Uses `hidden md:block` Tailwind classes

## How It Works

### Data Flow

1. **Initial Load**:
   - App loads → `useCurrencyRates` hook initializes
   - Fetches latest rate from backend `/api/fx/latest`
   - Updates local state and localStorage
   - Displays data to user

2. **Automatic Updates**:
   - Polling runs every 30 seconds
   - Compares fetched rate ID with last known rate
   - If new rate detected:
     - Moves current rate to history
     - Updates current rate
     - Saves to localStorage
     - UI automatically updates

3. **Admin Updates**:
   - Admin enters rate text in AdminPage
   - Parses using Gemini AI or local parser
   - Saves to backend first (with admin key)
   - Updates local state
   - Sends Telegram notification
   - All clients will detect the update within 30 seconds

4. **Manual Refresh**:
   - User clicks refresh button
   - Immediately fetches latest data
   - Updates UI with loading indicator
   - Shows success/error feedback

### Authentication

- **Public Endpoints**: `/api/fx/latest` - No auth required
- **Admin Endpoints**: `/api/admin/fx/*` - Requires admin key header
  - Header: `x-currex-admin-key: currex-admin-123`
  - Alternative: JWT Bearer token with ADMIN role

### Error Handling

- **Backend Unavailable**: 
  - Continues to use localStorage data
  - Shows cached rates
  - Logs errors to console only

- **Backend Save Fails**:
  - Still updates localStorage
  - Warns in console
  - User sees success message

- **Network Issues**:
  - Polling continues silently
  - No user-facing errors
  - Next successful poll will sync data

## Testing

### Test Backend Integration

1. **Test API Health**:
   ```bash
   curl https://www.shltechent.com/api/health
   # Should return: {"ok":true}
   ```

2. **Test Latest Rate Fetch**:
   ```bash
   curl https://www.shltechent.com/api/fx/latest
   # Should return full rate data
   ```

3. **Test Admin Save** (requires admin key):
   ```bash
   curl -X POST https://www.shltechent.com/api/admin/fx/parse \
     -H "Content-Type: application/json" \
     -H "x-currex-admin-key: currex-admin-123" \
     -d '{"text":"16-Oct-2025\n\nBank Transfer\n\nSelling 800\nBuying 820","base":"THB","quote":"MMK"}'
   ```

### Test Frontend

1. Open the currency exchanger in multiple browsers
2. Update rates in one browser (Admin page)
3. Watch other browsers update within 30 seconds
4. Click refresh button for immediate update
5. Check browser console for any errors

## Configuration

### Backend Environment Variables
Location: `/root/shltechent/sonesoebid_server/.env`

Required variables:
```env
CURREX_ADMIN_KEY=currex-admin-123
PORT=4000
CORS_ORIGINS=https://www.shltechent.com
```

### Frontend Configuration
Location: `services/apiService.ts`

```typescript
const API_BASE_URL = 'https://www.shltechent.com/api';
const ADMIN_KEY = 'currex-admin-123';
```

## Deployment

### Backend Server
```bash
cd /root/shltechent/sonesoebid_server
# Kill existing process
pkill -f "node ./src/index.js"
# Start server
nohup node ./src/index.js > /dev/null 2>&1 &
```

### Frontend
```bash
cd /root/shltechent/burmese-thai-currency-exchanger
npm run build
# Deploy dist/ folder to production
```

## Troubleshooting

### Rates not updating across browsers
1. Check backend server is running: `ps aux | grep "node ./src/index.js"`
2. Check API health: `curl https://www.shltechent.com/api/health`
3. Check browser console for errors
4. Verify CORS settings in backend `.env`

### Admin save failing
1. Verify admin key matches in frontend and backend
2. Check backend logs for errors
3. Verify database connection
4. Test with curl command above

### Polling not working
1. Check browser console for network errors
2. Verify polling interval is running (check network tab)
3. Check CORS headers in response
4. Try manual refresh button

## Benefits

✅ **Multi-Browser Sync**: All browsers stay in sync automatically  
✅ **Real-Time Updates**: 30-second polling ensures fresh data  
✅ **Offline Support**: localStorage fallback when backend unavailable  
✅ **Graceful Degradation**: Works even if backend fails  
✅ **Manual Refresh**: User control with refresh button  
✅ **Responsive Design**: Works on mobile and desktop  
✅ **No Data Loss**: Dual storage (backend + localStorage)  

## Future Enhancements

- [ ] WebSocket integration for instant updates (no polling)
- [ ] Push notifications for rate changes
- [ ] Rate change alerts
- [ ] Historical rate charts
- [ ] Rate comparison tools
- [ ] Multi-currency support

