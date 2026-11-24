import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRupiah } from '@/utils/formatRupiah';
import { getInitials } from '@/utils/getInitials';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { transferValidation } from '@/features/transfer/validations/transferValidation';

export default function Transfer() {
  const navigate = useNavigate();
  const { getMyWallet, getLookupRecipientWallet } = useWallet();

  const [myWallet, setMyWallet] = useState(null);
  const [query, setQuery] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchMyWallet = async () => {
      const data = await getMyWallet();

      setMyWallet(data);
    };

    fetchMyWallet();
  }, [getMyWallet]);

  const handleSearchRecipient = async () => {
    const keyword = query.trim();
    if (!keyword) {
      setLookupError('Masukkan username atau nomor dompet terlebih dahulu.');
      return;
    }

    setIsSearching(true);
    setLookupError('');
    setRecipient(null);

    try {
      const data = await getLookupRecipientWallet({ walletNumber: keyword });

      console.log(data);

      if (!data.walletId && !data.walletNumber) {
        setLookupError(
          data?.message ||
            'Penerima tidak ditemukan. Periksa kembali input Anda.',
        );
        return;
      }

      setRecipient({
        walletId: data.walletId,
        initials: getInitials(data.fullName),
        name: data.fullName,
        username: `@${data.userName}`,
        walletNumber: data.walletNumber,
      });
    } catch {
      setLookupError('Gagal mencari penerima. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDownSearch = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchRecipient();
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValue: {
      amount: 0,
      description: '',
    },
    resolver: yupResolver(transferValidation),
  });

  const onSubmit = async ({ amount, description }) => {
    if (!recipient) return;

    navigate('confirm', {
      state: {
        senderWalletId: myWallet?.walletId ?? myWallet?.id,
        receiverWalletId: recipient.walletId,
        recipientName: recipient.name,
        amount,
        balance: myWallet?.balance,
        description,
      },
    });
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-3xl bg-white p-8 lg:col-span-8"
      >
        <h2 className="text-xl font-bold text-[#111827]">Detail transfer</h2>

        <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
          PENERIMA
        </p>

        <div className="mt-3 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
              Cari berdasarkan nomor wallet
            </label>
            <div className="flex items-center gap-2.5">
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (lookupError) setLookupError('');
                }}
                onKeyDown={handleKeyDownSearch}
                placeholder="Ketik username atau nomor dompet..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSearchRecipient}
                disabled={isSearching || !query.trim()}
                className="shrink-0 gap-2 border-[#136C63] text-[#136C63] hover:bg-[#EAF3F0] hover:text-[#136C63]"
              >
                {isSearching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Cari
              </Button>
            </div>
            {lookupError && (
              <p className="mb-2 mt-2 block text-xs font-semibold text-red-400">
                {lookupError}
              </p>
            )}
          </div>

          {/* Kartu Penerima Terpilih */}
          {recipient && (
            <div className="flex items-center justify-between rounded-2xl bg-[#EAF3F0] p-4">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-full bg-[#136C63] text-sm font-bold text-white">
                  {recipient.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">
                    {recipient.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {recipient.username} &nbsp;·&nbsp; {recipient.walletNumber}
                  </p>
                </div>
              </div>
              <Check className="size-4 stroke-[2.5] text-[#136C63]" />
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
              Nominal transfer
            </label>
            <Input
              type="number"
              placeholder="Rp 75.000"
              errorMsg={errors?.amount?.message}
              {...register('amount')}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
              Catatan (opsional)
            </label>
            <Input
              placeholder="Tambahkan catatan..."
              {...register('description')}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={!recipient || isSearching || isSubmitting}
          className="mt-8 w-full justify-start px-5"
        >
          {isSubmitting ? 'Loading...' : 'Tinjau transfer'}
        </Button>
      </form>

      {/* Kartu Dompet Saya */}
      <div className="rounded-3xl bg-white p-7 lg:col-span-4">
        <h2 className="text-lg font-bold text-[#111827]">Dompet saya</h2>

        <div className="mt-6">
          <p className="text-xs text-[#6B7280]">Saldo tersedia</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#111827]">
            {myWallet?.balance !== undefined
              ? formatRupiah(myWallet.balance)
              : 'Rp 1.250.000'}
          </p>
        </div>

        <div className="my-5 border-t border-[#EDF2F0]" />

        <p className="text-xs leading-relaxed text-[#6B7280]">
          Pastikan penerima dan nominal sudah benar sebelum melanjutkan.
        </p>
      </div>
    </div>
  );
}
