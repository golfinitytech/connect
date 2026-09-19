import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Info, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Settings2,
  Trophy
} from 'lucide-react';

const TournamentRules = () => {
  const flightRules = [
    {
      title: "Komposisi Flight A & B",
      description: "Flight A (HCP 1-13) & Flight B (HCP 14-21) boleh satu flight.",
      status: "Allowed",
      type: "success"
    },
    {
      title: "Restriksi Flight C",
      description: "Flight C (HCP 22-28) harus terpisah dari Flight A & Flight B.",
      status: "Restricted",
      type: "danger"
    },
    {
      title: "Eksklusivitas Flight C",
      description: "Flight C hanya boleh dengan sesama Flight C.",
      status: "Mandatory",
      type: "info"
    },
    {
      title: "Rasio Flight B & A (Opsi 1)",
      description: "TIDAK BOLEH: 1 orang Flight B & 3 orang Flight A.",
      status: "Prohibited",
      type: "danger"
    },
    {
      title: "Rasio Flight A & B (Opsi 2)",
      description: "BOLEH: 1 orang Flight A & 3 orang Flight B.",
      status: "Allowed",
      type: "success"
    }
  ];

  const generalRules = [
    { label: "Kapasitas Minimal", value: "3 Peserta", detail: "Per Flight" },
    { label: "Kapasitas Maksimal", value: "4 Peserta", detail: "Per Flight" },
    { label: "Status Validasi", value: "Aktif", detail: "Real-time" }
  ];

  const ruleOfTheGame = [
    {
      text: "Tournament ini menggunakan System Winter Rule dengan ketentuan sbb :",
      subItems: [
        "Bola Kotor boleh di lap.",
        "Private list harus menjauhi hole.",
        "Jika bola jatuh di fairway yang becek/banjir maka bola boleh dipindah kesamping dengan posisi bola sejajar atau mencari fairway kering yang menjauhi hole.",
        "Jika penalty bola di drop maks 2 club stik dari entry ball.",
        "Lost ball di fairway (embedded/hilang) maka penalty 1 stroke dan bola di drop diarea bola hilang."
      ]
    },
    {
      text: "Jika Lost ball keluar fairway maka pemain terkena penalty 1 stroke dan bola didrop 2 club stik sejajar patok"
    },
    {
      text: "Posisi bola di bunker, jika stik menyentuh tanah saat practice atau sebelum memukul maka penalty 1 stroke."
    },
    {
      text: "Menginjak line lawan di green baik disengaja maupun tidak maka terkena penalty 1 stroke."
    },
    {
      text: "Jika terjadi ketidaksepahaman dilapangan, maka diputuskan oleh referee dengan cara telepon/menghubungi Anang (0812 2272 0915) atau Jeffrey (0821 2118 8842)"
    }
  ];

  const kodeEtikGolfer = [
    "Saat Tee off pertama akan diundi urutan pemukul pertama dst di tiap pairing.",
    "Tee off berikutnya dimulai dari score terbaik hole sebelumnya.",
    "Jika bola di track (obstruction) maka boleh Free Drop tanpa penalty sejauh 1 club stik.",
    "Jika bola berada diarea akar pohon harus tetap dipukul (tidak boleh free drop) atau penalty 1 stroke.",
    "Jika posisi memukul terganggu oleh ranting atau dahan pohon maka tidak boleh dipatahkan atau dibantu caddie. Jika dilanggar maka terkena penalty 1 stroke.",
    "Setelah Tee off urutan pemukul dimulai dari jarak terjauh, termasuk di Green.",
    "Bola dipukul sampai finish (masuk hole) atau penalty 1 stroke.",
    "Identitas bola diinformasikan kepada rekan satu pairing di hole pertama.",
    "Bola tidak boleh diganti dalam 1 hole yang sama (termasuk di green)",
    "Jika bola akan diganti dihole berikutnya, maka harus diinformasikan pada teman 1 pairing.",
    "Bola Putting menggunakan bola yang dipakai saat di Tee Box (tidak boleh diganti)"
  ];

  const handleDownloadPdf = () => {
    const safeText = (v: any) =>
      (v ?? '')
        .toString()
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    const now = new Date();
    const dateLabel = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: '2-digit' });

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Regulasi Pertandingan</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #0f172a; }
    h1 { font-size: 20px; margin: 0 0 4px 0; }
    .sub { color: #475569; font-size: 12px; margin: 0 0 18px 0; }
    .section { margin-top: 18px; }
    .section h2 { font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; }
    .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
    ul, ol { margin: 0; padding-left: 18px; }
    li { margin: 6px 0; line-height: 1.45; }
    .flight { margin: 0; padding: 0; list-style: none; }
    .flight li { margin: 10px 0; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; }
    .flight .t { font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; font-size: 12px; margin: 0 0 6px 0; }
    .flight .d { color: #334155; font-weight: 600; font-size: 12px; margin: 0; }
    .meta { display: flex; gap: 10px; flex-wrap: wrap; margin: 0; padding: 0; list-style: none; }
    .meta li { margin: 0; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 12px; color: #334155; font-weight: 700; }
    .note { color: #475569; font-size: 12px; font-weight: 600; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .logo { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #2563eb, #4338ca); }
  </style>
</head>
<body>
  <div class="brand">
    <div class="logo"></div>
    <div>
      <h1>Regulasi Pertandingan</h1>
      <p class="sub">GolfinityConnect • ${safeText(dateLabel)}</p>
    </div>
  </div>

  <div class="section">
    <h2>Aturan Komposisi Flight</h2>
    <div class="card">
      <ul class="flight">
        ${flightRules
          .map(r => `<li><div class="t">${safeText(r.title)} • ${safeText(r.status)}</div><p class="d">${safeText(r.description)}</p></li>`)
          .join('')}
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>Kapasitas Flight</h2>
    <div class="card">
      <ul class="meta">
        ${generalRules
          .map(s => `<li>${safeText(s.label)}: ${safeText(s.value)} (${safeText(s.detail)})</li>`)
          .join('')}
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>Rule of The Game</h2>
    <div class="card">
      <ol>
        ${ruleOfTheGame
          .map(item => {
            const main = `<li>${safeText(item.text)}`;
            const subs = item.subItems?.length
              ? `<ol type="a">${item.subItems.map(sub => `<li>${safeText(sub)}</li>`).join('')}</ol>`
              : '';
            return `${main}${subs}</li>`;
          })
          .join('')}
      </ol>
    </div>
  </div>

  <div class="section">
    <h2>Kode Etik Golfer</h2>
    <div class="card">
      <ol>
        ${kodeEtikGolfer.map(t => `<li>${safeText(t)}</li>`).join('')}
      </ol>
    </div>
  </div>

  <div class="section">
    <div class="note">
      Aturan ini bersifat mengikat dan akan divalidasi secara otomatis oleh sistem pada saat pengaturan jadwal flight.
    </div>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-10 font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[22px] flex items-center justify-center shadow-xl shadow-blue-100">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
                Regulasi <span className="text-blue-600">Pertandingan</span>
              </h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.2em] mt-1">
                Sistem Manajemen Flight & Standar Turnamen
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
            <Settings2 size={20} className="text-slate-400" />
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest text-right">
              Versi Dokumen v1.0.4<br/>
              <span className="text-emerald-500 text-[10px]">Tervalidasi Sistem</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Rules Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FileText size={22} className="text-blue-600" />
                </div>
                <h2 className="font-black text-xl text-slate-800 uppercase italic">Aturan Komposisi Flight</h2>
              </div>
              <Trophy size={24} className="text-slate-200" />
            </div>
            
            <div className="p-10 space-y-6">
              {flightRules.map((rule, index) => (
                <div key={index} className="group relative flex items-start gap-6 p-6 rounded-[32px] transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100">
                  <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                    rule.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                    rule.type === 'danger' ? 'bg-rose-50 text-rose-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {rule.type === 'success' ? <CheckCircle2 size={24} /> : 
                     rule.type === 'danger' ? <AlertCircle size={24} /> : 
                     <Info size={24} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-slate-800 uppercase text-sm tracking-wider italic">
                        {rule.title}
                      </h3>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        rule.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                        rule.type === 'danger' ? 'bg-rose-100 text-rose-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rule.status}
                      </span>
                    </div>
                    <p className="text-slate-600 font-semibold leading-relaxed text-[15px]">
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <FileText size={22} className="text-emerald-600" />
                </div>
                <h2 className="font-black text-xl text-slate-800 uppercase italic">Rule of The Game</h2>
              </div>
              <Trophy size={24} className="text-slate-200" />
            </div>

            <div className="p-10">
              <ol className="list-decimal pl-6 space-y-4 text-slate-700">
                {ruleOfTheGame.map((item, idx) => (
                  <li key={idx} className="font-semibold leading-relaxed">
                    <span className="text-[15px]">{item.text}</span>
                    {item.subItems && item.subItems.length > 0 && (
                      <ol className="list-[lower-alpha] pl-6 mt-3 space-y-2 text-slate-600">
                        {item.subItems.map((sub, subIdx) => (
                          <li key={subIdx} className="text-[15px] font-semibold leading-relaxed">
                            {sub}
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Info size={22} className="text-amber-600" />
                </div>
                <h2 className="font-black text-xl text-slate-800 uppercase italic">Kode Etik Golfer</h2>
              </div>
              <Trophy size={24} className="text-slate-200" />
            </div>

            <div className="p-10">
              <ol className="list-decimal pl-6 space-y-3 text-slate-700">
                {kodeEtikGolfer.map((item, idx) => (
                  <li key={idx} className="text-[15px] font-semibold leading-relaxed text-slate-600">
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-10">
          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[45px] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-4 mb-8">
              <Users size={28} className="text-blue-400" />
              <h3 className="text-xl font-black italic uppercase tracking-tight">Kapasitas Flight</h3>
            </div>
            <div className="space-y-6">
              {generalRules.map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[30px] backdrop-blur-md">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black italic">{stat.value}</span>
                    <span className="text-blue-400 text-[10px] font-bold uppercase mb-1">{stat.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines Notice */}
          <div className="bg-white rounded-[45px] border border-slate-100 p-10 shadow-sm">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
              <Info size={24} />
            </div>
            <h4 className="text-lg font-black text-slate-800 uppercase italic mb-4">Catatan Penting</h4>
            <p className="text-slate-500 font-semibold text-sm leading-relaxed mb-6">
              Aturan ini bersifat mengikat dan akan divalidasi secara otomatis oleh sistem pada saat pengaturan jadwal flight. Mohon pastikan seluruh pengurus turnamen memahami regulasi ini.
            </p>
            <div className="pt-6 border-t border-slate-50">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                Unduh Regulasi (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentRules;
