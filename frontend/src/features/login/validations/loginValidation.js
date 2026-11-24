import * as yup from 'yup';

export const loginValidation = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email wajib diisi')
    .email('Email harus valid'),
  password: yup
    .string()
    .required('Password wajib diisi')
    .min(3, 'Password minimal 3 karakter'),
});
