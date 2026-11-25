import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerValidation } from '@/features/register/validations/registerValidation';
import { registerUser } from '@/features/auth/services/authService';

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValue: {
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      passwordConfirm: '',
    },
    resolver: yupResolver(registerValidation),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);

      navigate('/login');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-12">
      <div className="flex flex-col justify-center bg-[#136C63] p-10 text-white lg:col-span-4 lg:p-14">
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Satu akun,
          <br />
          satu dompet.
        </h1>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
          Dompet digital akan otomatis dibuat setelah pendaftaran berhasil.
        </p>
      </div>

      <div className="flex items-center justify-center p-8 sm:p-14 lg:col-span-8">
        <div className="w-full max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-[#111827]">
            Buat akun KodaWallet
          </h2>
          <p className="mt-1.5 text-sm text-[#6B7280]">
            Isi data pribadi untuk mulai menggunakan dompet.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                  Nama lengkap
                </label>
                <Input
                  placeholder="Nama lengkap"
                  required
                  {...register('fullName')}
                  errorMsg={errors?.fullName?.message}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                  Username
                </label>
                <Input
                  placeholder="Username"
                  required
                  {...register('username')}
                  errorMsg={errors?.username?.message}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  required
                  {...register('email')}
                  errorMsg={errors?.email?.message}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                  Nomor telepon
                </label>
                <Input
                  type="tel"
                  placeholder="0812 3456 7890"
                  required
                  {...register('phoneNumber')}
                  errorMsg={errors?.phoneNumber?.message}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  required
                  {...register('password')}
                  errorMsg={errors?.password?.message}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                  Konfirmasi password
                </label>
                <Input
                  type="password"
                  placeholder="Ulangi password"
                  required
                  {...register('passwordConfirm')}
                  errorMsg={errors?.passwordConfirm?.message}
                />
              </div>
            </div>

            <p className="mt-6 text-xs text-[#6B7280]">
              Akun baru akan mendapatkan dompet aktif dengan saldo Rp0.
            </p>

            <Button
              type="submit"
              size="lg"
              className="mt-4 w-full justify-start px-5"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Loading...' : 'Buat akun'}
            </Button>

            <p className="mt-5 text-center text-xs text-[#6B7280]">
              Sudah terdaftar?{' '}
              <Link
                to="/"
                className="font-semibold text-[#136C63] hover:underline"
              >
                Masuk
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
