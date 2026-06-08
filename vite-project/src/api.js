/**
 * DvBakes — Centralized API Configuration
 *
 * In development:  uses Vite's /api proxy → http://localhost:8080
 * In production:   uses VITE_API_URL env variable (your Render backend URL)
 *
 * Usage:  import { API_BASE, apiFetch } from '../api';
 */

// Read from env var at build time (Vite replaces this)
// Falls back to '' so that /api/... calls use the same origin (works with Vite proxy in dev)
export const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Wrapper around fetch that:
 *  - Prepends the API_BASE automatically
 *  - Adds Content-Type: application/json by default
 *  - Appends Authorization header when a JWT token is stored in localStorage
 *  - Returns { data, error, status } — never throws
 */
export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('dvbakes_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    // Parse body (could be JSON or text)
    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      return { data: null, error: data?.error || data || `HTTP ${res.status}`, status: res.status };
    }

    return { data, error: null, status: res.status };
  } catch (err) {
    console.error(`[apiFetch] ${path} failed:`, err);
    return { data: null, error: 'Network error — please check your connection.', status: 0 };
  }
};

/** Convenience GET */
export const apiGet = (path) => apiFetch(path);

/** Convenience POST */
export const apiPost = (path, body) =>
  apiFetch(path, { method: 'POST', body: JSON.stringify(body) });

/** Convenience PUT */
export const apiPut = (path, body) =>
  apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });

/** Convenience DELETE */
export const apiDelete = (path, body) =>
  apiFetch(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined });
