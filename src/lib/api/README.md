# API Usage Guide

## Setup

The API is configured to use the base URL from environment variables. Make sure your `.env` file contains:

```env
NEXT_PUBLIC_API_URL=http://192.168.20.160:8090/
```

## Available APIs

- [Logs API](#logs-api) - `/api/logs`
- [Stats API](#stats-api) - `/api/stats`
- [Cameras API](#cameras-api) - `/api/cameras`

---

## Logs API

### Import

```typescript
import { getLogs, getLogById, getLogsByDateRange, formatDateForApi } from '@/lib/api';
// or
import { getLogs } from '@/lib/api/dashboardApis';
```

### Basic Usage

#### Fetch all logs with default pagination

```typescript
const response = await getLogs();
console.log(response.data); // Array of log entries
console.log(response.total); // Total number of logs
```

#### Fetch logs with pagination

```typescript
const response = await getLogs({
  page: 2,
  limit: 20,
});
```

#### Filter by camera ID

```typescript
const response = await getLogs({
  camera_id: 'CAM-001',
  page: 1,
  limit: 10,
});
```

#### Filter by date range

```typescript
const response = await getLogs({
  start_date: '2024-01-01',
  end_date: '2024-01-31',
});
```

#### Filter by gear status

```typescript
const response = await getLogs({
  gear_status: 'compliant', // or 'non-compliant', etc.
});
```

#### Combine multiple filters

```typescript
const response = await getLogs({
  page: 1,
  limit: 50,
  camera_id: 'CAM-001',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  gear_status: 'compliant',
});
```

### Helper Functions

#### Format date for API

```typescript
import { formatDateForApi } from '@/lib/api';

const today = new Date();
const formattedDate = formatDateForApi(today); // '2024-01-15'
```

#### Get logs by date range (with Date objects)

```typescript
import { getLogsByDateRange } from '@/lib/api';

const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');

const response = await getLogsByDateRange(startDate, endDate, {
  camera_id: 'CAM-001',
  limit: 20,
});
```

### React Component Example

```typescript
'use client';
import { useEffect, useState } from 'react';
import { getLogs, type LogsResponse } from '@/lib/api';

export default function LogsPage() {
  const [logs, setLogs] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await getLogs({
          page: 1,
          limit: 10,
        });
        setLogs(response);
      } catch (err) {
        setError('Failed to fetch logs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!logs) return <div>No data</div>;

  return (
    <div>
      <h1>Logs ({logs.total})</h1>
      <ul>
        {logs.data.map((log) => (
          <li key={log.id}>
            {log.camera_id} - {log.gear_status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Error Handling

The API automatically handles errors and logs them to the console. You can catch errors in your components:

```typescript
try {
  const response = await getLogs({ camera_id: 'invalid' });
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      // No response received
      console.log('Network error');
    }
  }
}
```

## Response Types

### LogsResponse

```typescript
interface LogsResponse {
  data: LogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### LogEntry

```typescript
interface LogEntry {
  id: string | number;
  timestamp: string;
  camera_id: string;
  gear_status: string;
  // Add other fields based on your API response
}
```

## Adding More APIs

To add more API endpoints:

1. Create a new file in `src/lib/api/` (e.g., `cameras.ts`)
2. Define types and functions similar to `logs.ts`
3. Export from `src/lib/api/index.ts`

```typescript
// src/lib/api/cameras.ts
export const getCameras = async () => {
  const response = await axiosInstance.get('/api/cameras');
  return response.data;
};

// src/lib/api/index.ts
export * from './cameras';
```


---

## Stats API

### Import

```typescript
import { getStats } from '@/lib/api';
// or
import { getStats } from '@/lib/api/dashboardApis';
```

### Basic Usage

#### Fetch dashboard statistics

```typescript
const stats = await getStats();

console.log(stats.data.total_detections);
console.log(stats.data.compliant_count);
console.log(stats.data.non_compliant_count);
console.log(stats.data.compliance_rate);
console.log(stats.data.active_cameras);
console.log(stats.data.total_cameras);
console.log(stats.data.critical_alerts);
console.log(stats.data.resolved_alerts);
```

### React Component Example

```typescript
'use client';
import { useEffect, useState } from 'react';
import { getStats, type StatsResponse } from '@/lib/api';

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats();
        setStats(response);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading stats...</div>;
  if (!stats) return <div>No data</div>;

  return (
    <div>
      <h2>Compliance Rate: {stats.data.compliance_rate}%</h2>
      <p>Cameras: {stats.data.active_cameras}/{stats.data.total_cameras}</p>
      <p>Critical Alerts: {stats.data.critical_alerts}</p>
    </div>
  );
}
```

### Response Types

#### StatsResponse

```typescript
interface StatsResponse {
  success: boolean;
  data: StatsData;
  timestamp: string;
}
```

#### StatsData

```typescript
interface StatsData {
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

---

## Cameras API

### Import

```typescript
import { getCameras, getCameraById, getCamerasByStatus, getCamerasByZone } from '@/lib/api';
// or
import { getCameras } from '@/lib/api/dashboardApis';
```

### Basic Usage

#### Fetch all cameras

```typescript
const response = await getCameras();
console.log(response.data); // Array of cameras
console.log(response.total); // Total number of cameras
```

#### Fetch a single camera by ID

```typescript
const camera = await getCameraById('CAM-001');
console.log(camera.data.name);
console.log(camera.data.status);
console.log(camera.data.location);
```

#### Filter cameras by status

```typescript
// Get only online cameras
const onlineCameras = await getCamerasByStatus('online');

// Get offline cameras
const offlineCameras = await getCamerasByStatus('offline');

// Get stale cameras
const staleCameras = await getCamerasByStatus('stale');
```

#### Filter cameras by zone

```typescript
const zoneCameras = await getCamerasByZone('Zone A');
console.log(zoneCameras); // Array of cameras in Zone A
```

### React Component Example

```typescript
'use client';
import { useEffect, useState } from 'react';
import { getCameras, type Camera } from '@/lib/api';

export default function CameraList() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await getCameras();
        setCameras(response.data);
      } catch (error) {
        console.error('Failed to fetch cameras:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  if (loading) return <div>Loading cameras...</div>;

  return (
    <div>
      <h1>Cameras ({cameras.length})</h1>
      <ul>
        {cameras.map((camera) => (
          <li key={camera.id}>
            {camera.name} - {camera.status} ({camera.location})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Advanced Example: Camera Status Dashboard

```typescript
'use client';
import { useEffect, useState } from 'react';
import { getCameras, getCamerasByStatus, type Camera } from '@/lib/api';

export default function CameraStatusDashboard() {
  const [onlineCameras, setOnlineCameras] = useState<Camera[]>([]);
  const [offlineCameras, setOfflineCameras] = useState<Camera[]>([]);
  const [staleCameras, setStaleCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCameraData = async () => {
      try {
        const [online, offline, stale] = await Promise.all([
          getCamerasByStatus('online'),
          getCamerasByStatus('offline'),
          getCamerasByStatus('stale'),
        ]);
        
        setOnlineCameras(online);
        setOfflineCameras(offline);
        setStaleCameras(stale);
      } catch (error) {
        console.error('Failed to fetch camera data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCameraData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div>
        <h2>Online ({onlineCameras.length})</h2>
        {onlineCameras.map(cam => <div key={cam.id}>{cam.name}</div>)}
      </div>
      <div>
        <h2>Offline ({offlineCameras.length})</h2>
        {offlineCameras.map(cam => <div key={cam.id}>{cam.name}</div>)}
      </div>
      <div>
        <h2>Stale ({staleCameras.length})</h2>
        {staleCameras.map(cam => <div key={cam.id}>{cam.name}</div>)}
      </div>
    </div>
  );
}
```

### Response Types

#### CamerasResponse

```typescript
interface CamerasResponse {
  success: boolean;
  data: Camera[];
  total: number;
}
```

#### Camera

```typescript
interface Camera {
  id: string | number;
  name: string;
  location: string;
  zone?: string;
  status: 'online' | 'offline' | 'stale';
  last_frame_time?: string;
  health_status?: string;
}
```

#### CameraDetailsResponse

```typescript
interface CameraDetailsResponse {
  success: boolean;
  data: Camera;
}
```

---

## Complete Import Example

```typescript
// Import everything at once
import {
  // Logs API
  getLogs,
  getLogById,
  getLogsByDateRange,
  formatDateForApi,
  
  // Stats API
  getStats,
  
  // Cameras API
  getCameras,
  getCameraById,
  getCamerasByStatus,
  getCamerasByZone,
  
  // Types
  type LogsParams,
  type LogEntry,
  type LogsResponse,
  type StatsData,
  type StatsResponse,
  type Camera,
  type CamerasResponse,
  type CameraDetailsResponse,
} from '@/lib/api';
```
