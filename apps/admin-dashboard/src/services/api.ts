import axios from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Background/polling request: don't show the global progress bar. */
    silent?: boolean;
  }
}

// ── In-flight request tracking (drives <GlobalProgressBar />) ───────────────
let inFlight = 0;
const listeners = new Set<(n: number) => void>();
const emit = () => listeners.forEach((l) => l(inFlight));
export const subscribeInFlight = (fn: (n: number) => void) => {
  listeners.add(fn);
  fn(inFlight);
  return () => {
    listeners.delete(fn);
  };
};
const track = (config: { silent?: boolean; __tracked?: boolean }) => {
  if (config.silent || config.__tracked) return;
  config.__tracked = true;
  inFlight += 1;
  emit();
};
const untrack = (config?: { __tracked?: boolean }) => {
  if (!config?.__tracked) return;
  config.__tracked = false;
  inFlight = Math.max(0, inFlight - 1);
  emit();
};

export const getBaseURL = () => {
  let url = 'http://localhost:3002/api';
  
  if (import.meta.env.VITE_API_BASE_URL) {
    url = import.meta.env.VITE_API_BASE_URL;
  } else if (import.meta.env.VITE_API_HOST) {
    // Hosting that only exposes the API's hostname (e.g. Render `fromService ... property: host`).
    url = `https://${import.meta.env.VITE_API_HOST}/api`;
  } else {
    // Dynamically determine the backend URL based on the current hostname
    const hostname = window.location.hostname;
    const protocol = window.location.protocol || 'http:';
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const isIp =
      /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
      hostname.includes(':');

    if (!isLocal) {
      // If frontend is on a public hostname, prefer a dedicated API subdomain:
      // e.g. gc.tep2.in -> api-gc.tep2.in (Cloudflared ingress)
      if (!isIp && !hostname.startsWith('api-')) {
        url = `${protocol}//api-${hostname}/api`;
      } else {
        // If we're accessing via IP/host, use the same host for the API port
        url = `${protocol}//${hostname}:3002/api`;
      }
    }
  }
  
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCurrentLocation = () => {
  try {
    // Check path for tablet users
    const path = window.location.pathname.toLowerCase();
    if (path.includes('userpadanggolfsulaiman')) return 'Padang Golf Sulaiman';
    if (path.includes('userjatinangorgolf')) return 'Jatinangor National Golf';
    if (path.includes('userpalmspringkarawang')) return 'Palm Springs Karawang';

    // Check admin login
    const adminLoc = localStorage.getItem('adminLocation');
    if (adminLoc && adminLoc !== 'Global Admin') return adminLoc;
  } catch (e) {
    // Ignore errors in non-browser environments
  }
  return undefined;
};

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add course filter automatically for tournament endpoints
    if (config.url && config.url.includes('/tournaments')) {
      const course = getCurrentLocation();
      if (course) {
        if (config.method === 'get' || config.method === 'delete') {
          config.params = { ...config.params, course };
        } else if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
          if (config.data && typeof config.data === 'object') {
            config.data = { ...config.data, course };
          }
        }
      }
    }

    track(config as any);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    untrack(response.config as any);
    return response;
  },
  (error) => {
    untrack(error?.config);
    return Promise.reject(error);
  }
);

export default api;
