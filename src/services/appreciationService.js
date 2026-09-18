/**
 * Appreciation Service
 * 
 * Clean API abstraction for the global portfolio appreciation count.
 * Connects to the backend endpoint:
 *   - GET  /api/portfolio/appreciate -> { "count": number }
 *   - POST /api/portfolio/appreciate -> { "count": number }
 */

export const APPRECIATION_DISPLAY_THRESHOLD = 40;

const API_ENDPOINT = '/api/portfolio/appreciate';

/**
 * Fetch the current global appreciation count from the server.
 * Returns { success: true, count } or { success: false, error, count: 0 }
 */
export async function fetchAppreciationCount() {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      count: typeof data.count === 'number' ? data.count : 0
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Network error',
      count: 0
    };
  }
}

/**
 * Send an appreciation request to increment or decrement the global count.
 * @param {'like' | 'unlike'} action
 * Returns { success: true, count } or { success: false, error }
 */
export async function submitAppreciation(action = 'like') {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      count: typeof data.count === 'number' ? data.count : null
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Network error'
    };
  }
}
