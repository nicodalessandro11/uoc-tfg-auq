// Real API utilities for making API calls

/**
 * Base URL for API calls - replace with your actual API URL
 * You might want to use an environment variable for this
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-api-url.com"

// Flag to determine whether to use mock data or real API
// Set to true to use mock data, false to use real API
const USE_MOCK_API = true

// Import the mock API implementation
import { getMockResponse } from "./mock-api-implementation"
// Import the logging function
import { logApiCall } from "@/components/api-debug"

/**
 * Fetch data from the API
 * @param endpoint - The API endpoint to fetch from (without the base URL)
 * @param options - Optional fetch options
 * @returns The JSON response from the API
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  const startTime = Date.now()
  try {
    // If using mock API, return mock data
    if (USE_MOCK_API) {
      console.log(`[MOCK API] Fetching from ${endpoint}`)
      const data = await getMockResponse(endpoint)
      const duration = Date.now() - startTime
      logApiCall(endpoint, true, duration)
      return data
    }

    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

    // Make the actual API call
    const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
      headers: {
        "Content-Type": "application/json",
        // Add any authentication headers here if needed
        // 'Authorization': `Bearer ${token}`,
      },
      ...options,
    })

    // Check if the response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const duration = Date.now() - startTime
      logApiCall(endpoint, false, duration)
      throw new Error(
        `API error: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ""}`,
      )
    }

    // Parse and return the JSON response
    const data = await response.json()
    const duration = Date.now() - startTime
    logApiCall(endpoint, true, duration)
    return data
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error)
    const duration = Date.now() - startTime
    logApiCall(endpoint, false, duration)
    throw error
  }
}

/**
 * Helper function to build API endpoints with query parameters
 * @param base - The base endpoint
 * @param params - The query parameters as an object
 * @returns The complete endpoint with query parameters
 */
export function buildEndpoint(base: string, params: Record<string, any>): string {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&")

  return queryParams ? `${base}?${queryParams}` : base
}

/**
 * Post data to the API
 * @param endpoint - The API endpoint to post to
 * @param data - The data to post
 * @returns The JSON response from the API
 */
export async function postAPI(endpoint: string, data: any): Promise<any> {
  const startTime = Date.now()

  // If using mock API, log the request and return a mock response
  if (USE_MOCK_API) {
    console.log(`[MOCK API] POST to ${endpoint} with data:`, data)
    await new Promise((resolve) => setTimeout(resolve, 300))
    const duration = Date.now() - startTime
    logApiCall(`POST ${endpoint}`, true, duration)
    return { success: true, message: "Mock POST successful" }
  }

  return fetchAPI(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Put data to the API
 * @param endpoint - The API endpoint to put to
 * @param data - The data to put
 * @returns The JSON response from the API
 */
export async function putAPI(endpoint: string, data: any): Promise<any> {
  const startTime = Date.now()

  // If using mock API, log the request and return a mock response
  if (USE_MOCK_API) {
    console.log(`[MOCK API] PUT to ${endpoint} with data:`, data)
    await new Promise((resolve) => setTimeout(resolve, 300))
    const duration = Date.now() - startTime
    logApiCall(`PUT ${endpoint}`, true, duration)
    return { success: true, message: "Mock PUT successful" }
  }

  return fetchAPI(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * Delete data from the API
 * @param endpoint - The API endpoint to delete from
 * @returns The JSON response from the API
 */
export async function deleteAPI(endpoint: string): Promise<any> {
  const startTime = Date.now()

  // If using mock API, log the request and return a mock response
  if (USE_MOCK_API) {
    console.log(`[MOCK API] DELETE to ${endpoint}`)
    await new Promise((resolve) => setTimeout(resolve, 300))
    const duration = Date.now() - startTime
    logApiCall(`DELETE ${endpoint}`, true, duration)
    return { success: true, message: "Mock DELETE successful" }
  }

  return fetchAPI(endpoint, {
    method: "DELETE",
  })
}
