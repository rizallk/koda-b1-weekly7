import { Link, Navigate, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginValidation } from '@/features/login/validations/loginValidation';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { login, isAuthenticated, userRole } = useAuth();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValue: {
      email: '',
      password: '',
    },
    resolver: yupResolver(loginValidation),
  });

  const onSubmit = async ({ email, password }) => {
    try {
      const { user } = await login({ email, password });

      if (user) {
        navigate(user?.roles[0] === 'ADMIN' ? '/admin' : '/', {
          replace: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isAuthenticated)
    return <Navigate to={userRole === 'ADMIN' ? '/admin' : '/'} replace />;

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-12">
      {/* Panel Brand Sisi Kiri */}
      <div className="flex flex-col justify-between bg-[#136C63] p-10 text-white lg:col-span-4 lg:p-14">
        <Link to="/" className="text-xl tracking-tight select-none">
          <strong className="font-bold text-white">koda</strong>{' '}
          <span className="font-normal text-white/90">wallet</span>
        </Link>

        <div className="my-12 lg:my-0">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Uangmu,
            <br />
            lebih terarah.
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
            Kelola saldo, kirim uang, dan lihat setiap transaksi dalam satu
            tempat.
          </p>
        </div>

        <div className="h-px w-full bg-white/35" />
      </div>

      {/* Form Masuk Sisi Kanan */}
      <div className="flex items-center justify-center p-8 sm:p-14 lg:col-span-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-[#111827]">
            Selamat datang kembali
          </h2>
          <p className="mt-1.5 text-sm text-[#6B7280]">
            Masuk untuk melanjutkan ke dompetmu.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                Email
              </label>
              <Input
                type="email"
                placeholder="user@example.com"
                errorMsg={errors?.email?.message}
                required
                {...register('email')}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••••••"
                errorMsg={errors?.password?.message}
                required
                {...register('password')}
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#136C63] hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full justify-start px-5"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Loading...' : 'Masuk ke akun'}
            </Button>

            <p className="pt-2 text-center text-xs text-[#6B7280]">
              Belum memiliki akun?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#136C63] hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
