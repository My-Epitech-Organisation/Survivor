import { getAPIUrl } from './config';

const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
        if (tokenCookie) {
            return tokenCookie.split('=')[1].trim();
        }
        return null;
    }
    return null;
};

const getAuthHeaders = (authToken?: string): HeadersInit => {

    let token : string | null
    if (authToken)
        token = authToken;
    else
        token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

export const authenticatedFetch = async (
    endpoint: string,
    options: RequestInit = {},
    token?: string
): Promise<Response> => {
    const apiUrl = getAPIUrl();
    const url = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint}`;

    const authHeaders = getAuthHeaders(token);

    const config: RequestInit = {
        ...options,
        headers: {
            ...authHeaders,
            ...options.headers,
        },
    };
    return fetch(url, config);
};

export const apiGet = async (endpoint: string, token?: string): Promise<Response> => {
    return authenticatedFetch(endpoint, { method: 'GET' }, token);
};

export const apiPost = async (
    endpoint: string,
    data?: unknown
): Promise<Response> => {
    return authenticatedFetch(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
};

export const apiPut = async (
    endpoint: string,
    data?: unknown
): Promise<Response> => {
    return authenticatedFetch(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
};

export const apiDelete = async (endpoint: string): Promise<Response> => {
    return authenticatedFetch(endpoint, { method: 'DELETE' });
};

export const api = {
    get: async <T = unknown>(endpoint: string, token?: string): Promise<{ data: T }> => {
        const response = await apiGet(endpoint, token);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        const data = await response.json();
        return { data };
    },

    post: async <T = unknown>(endpoint: string, data?: unknown): Promise<{ data: T }> => {
        const response = await apiPost(endpoint, data);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        const responseData = await response.json();
        return { data: responseData };
    },

    put: async <T = unknown>(endpoint: string, data?: unknown): Promise<{ data: T }> => {
        const response = await apiPut(endpoint, data);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        const responseData = await response.json();
        return { data: responseData };
    },

    delete: async <T = unknown>(endpoint: string): Promise<{ data: T }> => {
        const response = await apiDelete(endpoint);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        const responseData = await response.json();
        return { data: responseData };
    },
};

export default api;
