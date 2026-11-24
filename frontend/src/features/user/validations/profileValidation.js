import * as yup from 'yup';

export const profileValidation = yup.object({
  fullName: yup
    .string()
    .trim()
    .required('Nama lengkap wajib diisi')
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),

  username: yup
    .string()
    .trim()
    .required('Username wajib diisi')
    .min(3, 'Username minimal 3 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .matches(
      /^[a-zA-Z0-9._]+$/,
      'Username hanya boleh berisi huruf, angka, titik, dan garis bawah',
    ),

  email: yup
    .string()
    .trim()
    .required('Email wajib diisi')
    .email('Format email tidak valid'),

  phoneNumber: yup
    .string()
    .trim()
    .matches(/^[0-9+\s-]{9,15}$/, {
      message: 'Format nomor ponsel tidak valid',
      excludeEmptyString: true,
    })
    .default(''),
});
