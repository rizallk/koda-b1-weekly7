import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/features/user/hooks/useUser';
import { profileValidation } from '@/features/user/validations/profileValidation';

export default function Settings() {
  const { getUserProfile, updateUserProfile, isLoading } = useUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
    },
    resolver: yupResolver(profileValidation),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();

        reset({
          fullName: data?.fullName ?? '',
          username: data?.username ?? data?.userName ?? '',
          email: data?.email ?? '',
          phoneNumber: data?.phoneNumber ?? data?.phone ?? '',
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfile();
  }, [getUserProfile, reset]);

  const onSubmit = async (values) => {
    if (!isDirty) return;

    const payload = {
      fullName: values.fullName.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber?.trim() ?? '',
    };

    const res = await updateUserProfile(payload);

    if (res) {
      const updated = res?.data ?? res;
      reset({
        fullName: updated?.fullName ?? payload.fullName,
        username: updated?.username ?? updated?.userName ?? payload.username,
        email: updated?.email ?? payload.email,
        phoneNumber:
          updated?.phoneNumber ?? updated?.phone ?? payload.phoneNumber,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      {/* Kartu Informasi Profil */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-3xl bg-white p-8 lg:col-span-8"
      >
        <h2 className="text-xl font-bold text-[#111827]">Informasi profil</h2>
        <p className="mt-1 text-xs text-[#6B7280]">
          Informasi ini akan tampil di profil akunmu.
        </p>

        {isLoading ? (
          <div className="mt-7 space-y-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`field-skeleton-${idx}`}>
                <div className="mb-2 h-3.5 w-24 animate-pulse rounded bg-[#EDF2F0]" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-[#F3F6F5]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                Nama lengkap
              </label>
              <Input
                {...register('fullName')}
                disabled={isSubmitting}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-[#D9383A]">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                Username
              </label>
              <Input
                {...register('username')}
                disabled={isSubmitting}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p className="mt-1.5 text-xs text-[#D9383A]">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                Email
              </label>
              <Input
                type="email"
                {...register('email')}
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#D9383A]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
                Nomor ponsel
              </label>
              <Input
                {...register('phoneNumber')}
                disabled={isSubmitting}
                aria-invalid={!!errors.phoneNumber}
              />
              {errors.phoneNumber && (
                <p className="mt-1.5 text-xs text-[#D9383A]">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isLoading || isSubmitting || !isDirty}
          className="mt-8 w-full justify-start px-5"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan perubahan'}
        </Button>
      </form>

      {/* Kartu Keamanan Akun */}
      <div className="rounded-3xl bg-white p-7 lg:col-span-4">
        <h2 className="text-lg font-bold text-[#111827]">Keamanan akun</h2>

        <div className="mt-6">
          <p className="text-sm font-bold text-[#111827]">Kata sandi</p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#6B7280]">
            Ubah secara berkala untuk menjaga keamanan akunmu.
          </p>
        </div>

        <Button
          type="button"
          variant="soft"
          size="lg"
          className="mt-6 w-full justify-start px-5"
        >
          Ubah kata sandi
        </Button>
      </div>
    </div>
  );
}
