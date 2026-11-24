import { api, ApiError } from '@/lib/apiClient';

export { ApiError };

export const registerUser = async (payload) => {
  await api.post('/auth/register', payload, {
    showSuccess: true,
  });
};

export const loginUser = async ({ email, password }) => {
  const data = await api.post(
    '/auth/login',
    { email: email.trim(), password },
    {
      credentials: 'include',
      showSuccess: true,
    },
  );

  return validateSession(data);
};

let refreshInFlight = null;
export const refreshSession = () =>
  (refreshInFlight ??= api
    .post('/auth/refresh', null, {
      credentials: 'include',
      silentError: true,
    })
    .then(validateSession)
    .finally(() => (refreshInFlight = null)));

export const getCurrentUser = (accessToken) => {
  if (!accessToken) throw new ApiError(401, 'Access Token tidak tersedia.');
  return api.get('/auth/me', {
    token: accessToken,
    silentError: true,
  });
};

export const logoutUser = () =>
  api.post('/auth/logout', null, {
    credentials: 'include',
    silentError: true,
  });

const validateSession = (data) => {
  if (
    !data?.accessToken ||
    !data?.expiresAtUtc ||
    !data?.user?.id ||
    !data?.user?.email
  ) {
    throw new ApiError(500, 'Format response authentication tidak sesuai.');
  }
  return data;
};
