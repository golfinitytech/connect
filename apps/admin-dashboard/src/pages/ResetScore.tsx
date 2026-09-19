import React, { useState } from 'react';
import { AlertTriangle, Lock, RefreshCw } from 'lucide-react';
import api from '../services/api';

const ResetScore = () => {
  const [password, setPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== 'awan17') {
      setMessage({ text: 'Password salah! Anda tidak memiliki izin untuk melakukan reset.', type: 'error' });
      setPassword('');
      return;
    }

    // Confirm before action
    if (!window.confirm('PERINGATAN BAHAYA!\n\nApakah Anda yakin ingin mereset seluruh skor turnamen yang sedang berjalan? Tindakan ini tidak dapat dibatalkan dan semua caddie harus mengulang input dari awal.')) {
      setPassword('');
      return;
    }

    setIsResetting(true);

    try {
      // Panggil endpoint API khusus untuk reset skor (asumsi kita buat atau gunakan endpoint yang ada)
      // Untuk amannya, kita akan mengirim sinyal ke server untuk menghapus skor aktif.
      // Jika endpoint khusus belum ada, kita timpa data grup turnamen aktif dengan skor kosong.
      
      const response = await api.get('/tournaments/active');
      if (response.data && response.data.groups) {
        const groups = response.data.groups;
        
        // Kosongkan semua skor pemain di setiap grup
        const resetGroups = groups.map((g: any) => ({
          ...g,
          players: g.players.map((p: any) => ({
            ...p,
            scores: { IN: Array(9).fill(0), OUT: Array(9).fill(0) },
            approvals: { IN: Array(9).fill(false), OUT: Array(9).fill(false) },
            marshalEdited: { IN: Array(9).fill(false), OUT: Array(9).fill(false) }
          }))
        }));

        // Simpan kembali data yang sudah di-reset ke server
        // Menggunakan endpoint /tournaments/sync-scores karena itu yang tersedia
        const syncPromises = resetGroups.map((g: any) => 
          api.post('/tournaments/sync-scores', {
            flightCode: g.code,
            players: g.players
          })
        );
        await Promise.all(syncPromises);

        // Hapus localStorage di sisi Admin juga untuk amannya
        const groupCodes = groups.map((g: any) => g.code);
        groupCodes.forEach((code: string) => {
          localStorage.removeItem(`tournament_scores_${code}`);
        });

        // Update active_tournament di localStorage
        const activeTournament = localStorage.getItem('active_tournament');
        if (activeTournament) {
           const parsed = JSON.parse(activeTournament);
           parsed.groups = resetGroups;
           localStorage.setItem('active_tournament', JSON.stringify(parsed));
        }

        setMessage({ text: 'BERHASIL! Semua skor telah di-reset kembali ke angka nol (0). Harap minta seluruh Caddie untuk me-refresh halamannya.', type: 'success' });
      } else {
        setMessage({ text: 'Tidak ada turnamen aktif yang bisa di-reset saat ini.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Terjadi kesalahan saat menghubungi server. Gagal mereset skor.', type: 'error' });
    } finally {
      setIsResetting(false);
      setPassword('');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-3">
          <AlertTriangle className="text-rose-500" size={32} />
          Reset Score Turnamen
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Fitur ini digunakan untuk menghapus dan mengembalikan seluruh skor pemain pada turnamen yang sedang aktif ke angka nol (0), seolah-olah caddie belum melakukan penginputan sama sekali.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex gap-4">
          <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-800 text-sm uppercase tracking-wider mb-1">Peringatan Keras</h3>
            <p className="text-rose-600 text-sm">
              Tindakan ini <b>SANGAT FATAL</b> dan tidak dapat dibatalkan (Undo). Seluruh hasil kerja keras input caddie di lapangan akan hilang seketika. Pastikan Anda memiliki otoritas penuh sebelum melanjutkan.
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Password Otoritas
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password rahasia..."
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white focus:border-rose-500 transition-colors font-mono"
                required
                disabled={isResetting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isResetting || !password}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all ${
              isResetting || !password 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-500/25 hover:shadow-lg'
            }`}
          >
            {isResetting ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                MEMPROSES RESET...
              </>
            ) : (
              <>
                <AlertTriangle size={18} />
                RESET SEMUA SKOR SEKARANG
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetScore;
