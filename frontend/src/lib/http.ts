import axios from "axios"

// Helper to get the correct API URL depending on the environment
const getBaseUrl = () => {
    // If we're on the server (Next.js SSR/RSC)
    if (typeof window === 'undefined') {
        // Point directly to the Java backend container or localhost
        // Next.js running in Docker will use http://api:8080/api
        // Next.js running locally will use http://localhost:8080/api
        return process.env.BACKEND_API_URL || "http://localhost:8080/api";
    }
    // If we're on the client (Browser)
    return "/api";
};

export const http = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
})

export function getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error && 'request' in error) {
        const axiosError = error as { code?: string; response?: { status?: number; data?: unknown } }

        if (axiosError.code === "ECONNABORTED") {
            return "Request timed out. Please check your connection and try again."
        }
        if (axiosError.code === "ERR_NETWORK" || !axiosError.response) {
            return "Network error. Please check your connection and try again."
        }

        const status = axiosError.response?.status
        const errorData = axiosError.response?.data as { error?: string; details?: unknown } | undefined

        if (errorData?.error) {
            return errorData.error
        }

        switch (status) {
            case 400:
                return "Invalid request. Please check your input and try again."
            case 401:
                return "Authentication required. Please sign in."
            case 403:
                return "You don't have permission to perform this action."
            case 404:
                return "Resource not found."
            case 409:
                return "This resource already exists."
            case 422:
                return "Validation failed. Please check your input."
            case 500:
                return "Server error. Please try again later."
            default:
                return `Request failed with status ${status}. Please try again.`
        }
    }

    if (error instanceof Error) {
        return error.message
    }

    return "An unexpected error occurred. Please try again."
}

http.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)

http.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = getErrorMessage(error)
        if (error instanceof Error) {
            error.message = message
        }
        return Promise.reject(error)
    }
)