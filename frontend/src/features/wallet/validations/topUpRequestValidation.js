import * as yup from 'yup';

export const topUpRequestValidation = yup.object({
  amount: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? undefined : value,
    )
    .typeError('Nominal isi saldo harus berupa angka')
    .required('Nominal wajib diisi')
    .min(10000, 'Nominal isi saldo minimal Rp. 10.000')
    .max(100000000, 'Nominal isi saldo maksimal Rp. 100.000.000'),
});
