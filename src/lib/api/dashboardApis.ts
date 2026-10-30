import axiosInstance from '../axios';

// ==================== LOGS API ====================

// Types for the logs API
export interface LogsParams {
  page?: number;
  limit?: number;
  camera_id?: number;
  start_date?: string; // Format: YYYY-MM-DD
  end_date?: string; // Format: YYYY-MM-DD
  gear_status?: string;
}

export interface LogMetadata {
  gear_status: string;
  compliant: boolean;
  helmet_present: boolean;
  vest_present: boolean;
  boot_present: boolean;
  helmet_status: string;
  vest_status: string;
  boot_status: string;
  violations: string[];
  [key: string]: unknown;
}

export interface LogEntry {
  id: number;
  source_id: number;
  track_id: number;
  camera_id: number;
  zone_id: number;
  behaviour_id: number;
  behaviour_name: string;
  event_timestamp: string;
  reference_id: string;
  image_paths: string;
  metadata_json: LogMetadata;
  created_at: string;
  gear_status: string;
  compliant: boolean;
  violations: string[];
  image_urls: string[];
}

export interface LogsResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: LogEntry[];
}

/**
 * Fetch logs from the API
 * @param params - Query parameters for filtering logs
 * @returns Promise with logs response
 */
export const getLogs = async (params?: LogsParams): Promise<LogsResponse> => {
  try {
    const requestParams = {
      page: params?.page || 1,
      limit: params?.limit || 10,
      ...(params?.camera_id !== undefined && params?.camera_id !== null && { camera_id: params.camera_id }),
      ...(params?.start_date && { start_date: params.start_date }),
      ...(params?.end_date && { end_date: params.end_date }),
      ...(params?.gear_status && { gear_status: params.gear_status }),
    };
    
    console.log('getLogs API - Request params:', requestParams);
    
    const response = await axiosInstance.get<LogsResponse>('api/logs', {
      params: requestParams,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

/**
 * Fetch a single log entry by ID
 * @param id - Log entry ID
 * @returns Promise with log entry
 */
export const getLogById = async (id: string | number): Promise<LogEntry> => {
  try {
    const response = await axiosInstance.get<LogEntry>(`api/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching log ${id}:`, error);
    throw error;
  }
};

/**
 * Helper function to format date to YYYY-MM-DD
 * @param date - Date object or string
 * @returns Formatted date string
 */
export const formatDateForApi = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Example usage with date range
 */
export const getLogsByDateRange = async (
  startDate: Date | string,
  endDate: Date | string,
  otherParams?: Omit<LogsParams, 'start_date' | 'end_date'>
): Promise<LogsResponse> => {
  return getLogs({
    ...otherParams,
    start_date: formatDateForApi(startDate),
    end_date: formatDateForApi(endDate),
  });
};

/**
 * Get image URL for evidence
 * Routes through the Next.js proxy so it works in both dev and on Vercel.
 * @param filename - Image filename from API
 * @returns Full image URL
 */
export const getImageUrl = (filename: string): string => {
  const cleanFilename = filename.replace(/[\[\]'",]/g, '').trim();
  const base = (process.env.NEXT_PUBLIC_API_URL || '/api/proxy').replace(/\/?$/, '/');
  return `${base}api/images/${cleanFilename}`;
};

// ==================== STATS API ====================

// Types for the stats API
export interface StatsData {
  total_logs: number;
  total_workers: number;
  full_gear: number;
  half_gear: number;
  no_ppe: number;
  compliance_rate: number;
  total_images: number;
}

export interface StatsResponse {
  success?: boolean;
  data?: StatsData;
  timestamp?: string;
}

/**
 * Fetch dashboard statistics
 * @param params - Optional date range filters
 * @returns Promise with stats response
 */
export const getStats = async (params?: { start_date?: string; end_date?: string }): Promise<StatsData> => {
  try {
    const response = await axiosInstance.get<StatsData>('api/stats', {
      params: {
        ...(params?.start_date && { start_date: params.start_date }),
        ...(params?.end_date && { end_date: params.end_date }),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// ==================== CAMERAS API ====================

// Types for the cameras API
export interface Camera {
  camera_id: number;
  camera_name: string;
  total_logs: number;
  compliant_logs: number;
  violation_logs: number;
}

export interface CamerasResponse {
  success?: boolean;
  data?: Camera[];
  total?: number;
}

export interface CameraDetailsResponse {
  success: boolean;
  data: Camera;
}

/**
 * Fetch all cameras
 * @returns Promise with cameras response
 */
export const getCameras = async (): Promise<Camera[]> => {
  try {
    const response = await axiosInstance.get<Camera[]>('api/cameras');
    return response.data;
  } catch (error) {
    console.error('Error fetching cameras:', error);
    throw error;
  }
};

/**
 * Fetch a single camera by ID
 * @param id - Camera ID
 * @returns Promise with camera details
 */
export const getCameraById = async (id: string | number): Promise<Camera> => {
  try {
    const response = await axiosInstance.get<Camera>(`api/cameras/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching camera ${id}:`, error);
    throw error;
  }
};

/**
 * Get cameras by status
 * @param status - Camera status filter
 * @returns Promise with filtered cameras
 */
export const getCamerasByStatus = async (status: 'online' | 'offline' | 'stale'): Promise<Camera[]> => {
  try {
    const cameras = await getCameras();
    // Filter logic can be implemented based on camera properties
    // For now, returning all cameras as the API structure doesn't include status
    return cameras;
  } catch (error) {
    console.error(`Error fetching ${status} cameras:`, error);
    throw error;
  }
};

/**
 * Get cameras by zone
 * @param zone - Zone name
 * @returns Promise with filtered cameras
 */
export const getCamerasByZone = async (zone: string): Promise<Camera[]> => {
  try {
    const cameras = await getCameras();
    // Filter by zone if the API adds zone information to cameras
    return cameras.filter(camera => camera.camera_name.includes(zone));
  } catch (error) {
    console.error(`Error fetching cameras for zone ${zone}:`, error);
    throw error;
  }
};
