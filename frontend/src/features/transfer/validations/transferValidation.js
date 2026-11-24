import * as yup from 'yup';

export const transferValidation = yup.object({
  amount: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? undefined : value,
    )
    .typeError('Nominal transfer harus berupa angka')
    .required('Nominal wajib diisi')
    .min(10000, 'Nominal transfer minimal Rp. 10.000')
    .max(100000000, 'Nominal transfer maksimal Rp. 100.000.000'),
});
