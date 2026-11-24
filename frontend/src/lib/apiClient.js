import { API_BASE_URL } from '@/config';
import { toast } from './toast';

const HTTP_ERROR_MESSAGES = {
  400: 'Permintaan tidak valid.',
  401: 'Sesi berakhir atau tidak terautentikasi. Silakan login kembali.',
  403: 'Anda tidak memiliki izin untuk mengakses resource ini.',
  404: 'Data atau endpoint tidak ditemukan.',
  408: 'Waktu permintaan habis. Silakan coba lagi.',
  422: 'Data yang dikirim tidak sesuai format.',
  429: 'Terlalu banyak request. Silakan coba kembali nanti.',
};

export class ApiError extends Error {
  constructor(status, message, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

function resolveErrorMessage(status, data) {
  const firstValidationErr = data?.errors
    ? Object.values(data.errors).flat()[0]
    : null;
  if (firstValidationErr) return firstValidationErr;

  const backendMessage = data?.detail ?? data?.message ?? data?.title;
  if (backendMessage) return backendMessage;

  if (status >= 500) return 'Server sedang mengalami gangguan.';
  return (
    HTTP_ERROR_MESSAGES[status] ??
    'Terjadi kesalahan saat memproses permintaan.'
  );
}

function resolveErrorTitle(status) {
  if (status === 0) return 'Koneksi Bermasalah';
  if (status === 401) return 'Autentikasi Gagal';
  if (status === 403) return 'Akses Ditolak';
  if (status === 400 || status === 422) return 'Validasi Gagal';
  if (status >= 500) return 'Gangguan Server';
  return 'Terjadi Kesalahan';
}

let defaultAccessToken = null;
let refreshHandler = null;
let refreshPromise = null;

export function setApiAccessToken(token) {
  defaultAccessToken = token ?? null;
}

export function setApiRefreshHandler(handler) {
  refreshHandler = handler;
}

async function request(
  endpoint,
  {
    method = 'GET',
    body,
    token = defaultAccessToken,
    headers,
    silentError = false,
    showSuccess = false,
    successMessage,
    _retry = false,
    ...options
  } = {},
) {
  if (!API_BASE_URL) {
    const msg = 'VITE_API_BASE_URL belum dikonfigurasi.';
    if (!silentError) toast.error(msg, { title: 'Konfigurasi Error' });
    throw new ApiError(0, msg);
  }

  const isFormData = body instanceof FormData;

  const config = {
    method,
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(body && !isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(body && { body: isFormData ? body : JSON.stringify(body) }),
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, config);
  } catch (err) {
    if (err?.name === 'AbortError') throw err;

    const msg =
      'Tidak dapat menghubungi API. Periksa server, jaringan, dan CORS.';
    if (!silentError) {
      toast.error(msg, { title: resolveErrorTitle(0) });
    }
    throw new ApiError(0, msg);
  }

  if (
    response.status === 401 &&
    !_retry &&
    refreshHandler &&
    !endpoint.includes('/refresh')
  ) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshHandler().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        return request(endpoint, {
          method,
          body,
          token: newAccessToken,
          headers,
          silentError,
          showSuccess,
          successMessage,
          _retry: true,
          ...options,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  const isJson = response.headers.get('content-type')?.includes('json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const errorMessage = resolveErrorMessage(response.status, data);

    if (!silentError) {
      toast.error(errorMessage, { title: resolveErrorTitle(response.status) });
    }

    throw new ApiError(response.status, errorMessage, data?.errors ?? null);
  }

  if (showSuccess || successMessage) {
    toast.success(
      successMessage || data?.message || 'Permintaan berhasil diproses.',
    );
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) =>
    request(endpoint, { ...options, method: 'DELETE' }),
};
