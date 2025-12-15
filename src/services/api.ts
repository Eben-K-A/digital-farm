const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Set authorization header with token
function getAuthHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// Parse error response
function parseError(response: Response, data: any) {
  const errorMessage = data?.error?.message || 'An error occurred';
  const errorCode = data?.error?.code || 'UNKNOWN_ERROR';

  const error = new Error(errorMessage) as any;
  error.code = errorCode;
  error.status = response.status;
  error.details = data?.error?.details || {};

  return error;
}

// Auth API
export const authAPI = {
  register: async (email: string, password: string, firstName: string, lastName: string, phoneNumber: string, userType: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        user_type: userType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw parseError(response, data);
    }

    return data.data;
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw parseError(response, data);
    }

    return data.data;
  },

  getMe: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw parseError(response, data);
    }

    return data.data;
  },
};

// Farmer Verification API
export const verificationAPI = {
  initiate: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/farmers/verify/initiate`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) {
      throw parseError(response, data);
    }

    return data.data;
  },

  submitStep: async (token: string, step: number, stepData: any) => {
    const response = await fetch(`${API_BASE_URL}/farmers/verify/step/${step}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(stepData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw parseError(response, data);
    }

    return data.data;
  },

  sendOTP: async (token: string, phoneNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/farmers/verify/otp/send`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ phone_number: phoneNumber }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw parseError(response, data);
    }

    return data.data;
  },

  verifyOTP: async (token: string, otpCode: string) => {
    const response = await fetch(`${API_BASE_URL}/farmers/verify/otp/verify`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ otp_code: otpCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw parseError(response, data);
    }

    return data.data;
  },

  getStatus: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/farmers/verify/status`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw parseError(response, data);
    }

    return data.data;
  },

  submit: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/farmers/verify/submit`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) {
      throw parseError(response, data);
    }

    return data.data;
  },
};
