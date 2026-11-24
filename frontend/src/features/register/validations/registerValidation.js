import * as yup from 'yup';

const idPhoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,10}$/;

export const registerValidation = yup.object({
  fullName: yup
    .string()
    .required('Nama lengkap wajib diisi')
    .min(5, 'Nama lengkap minimal 5 karakter')
    .max(120, 'Nama lengkap maksimal 120 karakter'),
  username: yup
    .string()
    .required('Username wajib diisi')
    .min(5, 'Username minimal 5 karakter')
    .max(100, 'Username maksimal 100 karakter'),
  email: yup
    .string()
    .required('Email wajib diisi')
    .email('Email harus valid')
    .min(8, 'Username minimal 8 karakter')
    .max(100, 'Username maksimal 100 karakter'),
  phoneNumber: yup
    .string()
    .matches(idPhoneRegex, 'Nomor telepon tidak valid')
    .required('Nomor telepon wajib diisi')
    .min(11, 'Nomor telepon minimal 11 karakter')
    .max(25, 'Nomor telepon maksimal 25 karakter'),
  password: yup
    .string()
    .required('Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(50, 'Password minimal 50 karakter'),
  passwordConfirm: yup
    .string()
    .required('Konfirmasi Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .max(50, 'Password minimal 50 karakter'),
});
