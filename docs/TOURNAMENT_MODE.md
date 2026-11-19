# Tournament Mode

## Alur hari H

1. **Admin → Create Tournament** → isi data, import/isi pemain, atur flight → *Confirm & Publish*.
   Setelah publish muncul:
   - **Kode turnamen** (3 angka, mis. `482`)
   - **PIN marshal** (4 angka). Catat PIN ini karena cuma ditampilkan sekali. Kalau perlu, bisa diganti lewat tombol *Atur PIN Marshal* di halaman Tournament Players.
   - Flight bernomor `1`, `2`, `3`, …
2. **Tablet (caddie)** → Tournament Access → ketik **kode turnamen** → ketik **nomor flight** → *Start Group Round*.
   Kode turnamen diingat tablet, jadi untuk flight berikutnya cukup ketik nomor flight.
3. **Input skor**: caddie isi skor per hole (1–15, atau OUT kalau pemain mundur).
4. **Validasi player**: tombol *Confirm Player* → pemain mengecek dan mengonfirmasi skor hole tsb.
   Setelah dikonfirmasi skor **terkunci**. Server menolak perubahan dari caddie.
5. **Edit marshal**: klik skor yang terkunci → masukkan PIN marshal → ubah skor. PIN dicek di server
   dan setiap perubahan tercatat (siapa, kapan, skor lama → baru).
6. **Ranking otomatis (Gross)**: dihitung di server dari skor yang **sudah dikonfirmasi**.
   - Live: urut to-par dari hole yang sudah dimainkan, lalu jumlah hole terbanyak.
   - Seri setelah 18 hole: countback back 9 (hole 10–18) → 6 terakhir → 3 terakhir → hole 18. Masih sama = `T1`, `T2`, …
   - Ada ranking overall dan per kategori (A/B/C).
   - Pemain OUT ditaruh di bawah.
7. **Pesan**: caddie ↔ marshal ↔ pusat kontrol. Pesan tersimpan di database, jadi tidak hilang kalau server restart.

## Deploy (wajib sebelum dipakai)

Database sekarang **PostgreSQL di Supabase** (sebelumnya MySQL di server lama). Isi `DATABASE_URL` dan
`DIRECT_URL` di `apps/api/.env` (lihat `.env.example`), lalu:

```bash
npm run prisma:push       # buat semua tabel di Supabase
npm run prisma:generate
npm -w apps/api run prisma:seed   # opsional: data contoh (hanya di database kosong)
npm run build && pm2 restart golfinity-api
```

> Pakai `prisma db push`. Folder `prisma/migrations` lama (SQL MySQL) sudah dihapus karena tidak
> berlaku untuk Postgres.

Opsional `.env`: `MARSHAL_PIN=1234`, dipakai sebagai cadangan kalau turnamen belum punya PIN.


## Endpoint baru

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/tournaments/access/:code` | Tablet: kode turnamen → info + daftar flight |
| GET | `/api/tournaments/access/:code/flights/:no` | Tablet: data scorecard satu flight |
| PUT | `/api/tournaments/:id/scores` | Input skor caddie (ditolak kalau sudah terkunci, cek versi antar device) |
| POST | `/api/tournaments/:id/scores/validate` | Konfirmasi player |
| POST | `/api/tournaments/:id/scores/marshal-edit` | Edit marshal (perlu PIN) |
| POST | `/api/tournaments/:id/marshal/verify` | Cek PIN marshal |
| GET | `/api/tournaments/:id/leaderboard` · `/api/tournaments/active/leaderboard` | Ranking resmi |
| GET | `/api/tournaments/:id/score-logs` | Riwayat semua perubahan skor |
| GET/POST | `/api/tournaments/:id/messages` | Pesan |
| PATCH | `/api/tournaments/:id/settings` | Ganti PIN marshal / par / nama |
| POST | `/api/tournaments/:id/finish` · `/reopen` | Kunci / buka semua skor |

`DELETE /api/tournaments` sekarang **mengarsipkan** turnamen aktif. Sebelumnya endpoint ini menghapus semua turnamen.

## Belum dikerjakan (perlu sebelum event)

- **Login admin sungguhan.** Endpoint admin (create/edit/settings/finish/logs) belum dikunci; login dashboard masih hardcoded di browser.
- Tombol *Finish tournament* dan halaman riwayat perubahan skor di dashboard (API-nya sudah ada).
- Par per lapangan masih default dashboard (bisa diubah lewat `PATCH /settings` → `pars`).
