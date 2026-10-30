# API Quick Reference

## Import

```typescript
import { getLogs, getStats, getCameras } from '@/lib/api';
```

## Logs API

| Function | Endpoint | Description |
|----------|----------|-------------|
| `getLogs(params?)` | `GET /api/logs` | Fetch logs with optional filters |
| `getLogById(id)` | `GET /api/logs/:id` | Fetch single log entry |
| `getLogsByDateRange(start, end, params?)` | `GET /api/logs` | Fetch logs by date range |
| `formatDateForApi(date)` | - | Helper to format dates to YYYY-MM-DD |

### Logs Parameters

```typescript
{
  page?: number;           // Page number (default: 1)
  limit?: number;          // Items per page (default: 10)
  camera_id?: string;      // Filter by camera
  start_date?: string;     // Format: YYYY-MM-DD
  end_date?: string;       // Format: YYYY-MM-DD
  gear_status?: string;    // Filter by gear status
}
```

## Stats API

| Function | Endpoint | Description |
|----------|----------|-------------|
| `getStats()` | `GET /api/stats` | Fetch dashboard statistics |

### Stats Response

```typescript
{
  total_detections: number;
  compliant_count: number;
  non_compliant_count: number;
  compliance_rate: number;
  active_cameras: number;
  total_cameras: number;
  critical_alerts: number;
  resolved_alerts: number;
}
```

## Cameras API

| Function | Endpoint | Description |
|----------|----------|-------------|
| `getCameras()` | `GET /api/cameras` | Fetch all cameras |
| `getCameraById(id)` | `GET /api/cameras/:id` | Fetch single camera |
| `getCamerasByStatus(status)` | `GET /api/cameras` | Filter cameras by status (client-side) |
| `getCamerasByZone(zone)` | `GET /api/cameras` | Filter cameras by zone (client-side) |

### Camera Status

- `'online'` - Camera is active and sending frames
- `'offline'` - Camera is not responding
- `'stale'` - Camera is connected but not updating

## Quick Examples

### Fetch Today's Logs

```typescript
const today = new Date();
const logs = await getLogs({
  start_date: formatDateForApi(today),
  end_date: formatDateForApi(today),
  limit: 50
});
```

### Get Dashboard Stats

```typescript
const stats = await getStats();
const complianceRate = stats.data.compliance_rate;
```

### Get Online Cameras

```typescript
const onlineCameras = await getCamerasByStatus('online');
const count = onlineCameras.length;
```

### Combined Data Fetch

```typescript
const [logs, stats, cameras] = await Promise.all([
  getLogs({ limit: 10 }),
  getStats(),
  getCameras()
]);
```

## Error Handling

```typescript
try {
  const data = await getLogs();
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

## Environment Setup

```env
# .env file
NEXT_PUBLIC_API_URL=http://192.168.20.160:8090/
```
