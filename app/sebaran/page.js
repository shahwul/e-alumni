"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Filter, Loader2, CalendarRange } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, LineChart, Line 
} from 'recharts';

// --- SETUP MAP COMPONENT ---
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });
import "leaflet/dist/leaflet.css";

const YOGYA_BOUNDS = [
  [-8.20, 110.00], // Southwest
  [-7.50, 110.80], // Northeast
];


// --- KONSTANTA & HELPER ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c'];

// 1. MAPPING KODE -> NAMA (Untuk Display Judul & Tooltip)
const CODE_TO_NAME = {
  "34.01": "KULON PROGO",
  "34.02": "BANTUL",
  "34.03": "GUNUNGKIDUL",
  "34.04": "SLEMAN",
  "34.71": "KOTA YOGYAKARTA"
};

// 2. MAPPING NAMA -> KODE (Untuk Logic Dropdown & API)
// Kita tambahkan variasi nama biar aman (Capslock, Title Case, ada 'Kab' atau tidak)
const NAME_TO_CODE = {
  // Format API (CAPSLOCK)
  "KULON PROGO": "34.01",
  "BANTUL": "34.02",
  "GUNUNGKIDUL": "34.03",
  "SLEMAN": "34.04",
  "KOTA YOGYAKARTA": "34.71",
  
  // Format Title Case / Variasi (Jaga-jaga)
  "Kulon Progo": "34.01",
  "Bantul": "34.02",
  "Gunungkidul": "34.03",
  "Sleman": "34.04",
  "Kota Yogyakarta": "34.71",
  "Kab. Kulon Progo": "34.01",
  "Kab. Bantul": "34.02",
  "Kab. Gunungkidul": "34.03",
  "Kab. Sleman": "34.04"
};

const getKabNameByCode = (code) => CODE_TO_NAME[code] || code;

// Generate List Tahun (5 tahun ke belakang)
const currentYear = new Date().getFullYear();
const YEAR_LIST = Array.from({length: 6}, (_, i) => currentYear - i);

// --- CHART CARD ---
const ChartCard = ({ title, children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
    <h5 className="text-sm font-semibold text-slate-600 mb-4">{title}</h5>
    <div className="w-full h-[250px] relative">
      {children}
    </div>
  </div>
);

// --- KOMPONEN DATA SECTION ---
// data fetches here
const DataSection = ({ selectedKab, selectedKec, selectedYear, kabupatenName }) => { 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedKab) params.append('kab', selectedKab);
        if (selectedKec) params.append('kec', selectedKec);
        if (selectedYear) params.append('year', selectedYear);
        
        const res = await fetch(`/api/dashboard/stats?${params.toString()}`);
        if (!res.ok) throw new Error("Gagal fetch stats");
        const result = await res.json();
        setData(result);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchStats();
  }, [selectedKab, selectedKec, selectedYear]);

  const processData = (arr, colors = COLORS) => {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map((item, index) => ({
      name: item.name,
      value: Number(item.value),
      fill: colors[index % colors.length]
    }));
  };

  const statusData = useMemo(() => processData(data?.statusKepegawaian), [data]);
  const ptkAlumniData = useMemo(() => processData(data?.ptkVsAlumni, ['#82ca9d', '#8884d8']), [data]);
  const kepsekData = useMemo(() => processData(data?.kepsekVsGuru, ['#8884d8', '#00C49F']), [data]);
  const jabatanData = useMemo(() => processData(data?.jabatan), [data]);
  const triwulanData = useMemo(() => data?.trenTriwulan?.map(d => ({...d, alumni: Number(d.alumni)})) || [], [data]);
  const tahunanData = useMemo(() => data?.trenTahunan?.map(d => ({...d, alumni: Number(d.alumni)})) || [], [data]);

  // Tooltip for stat hover 
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      const total = payload[0].payload.totalCount || 0;
      const percent = total > 0 ? ((dataPoint.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded text-xs">
          <p className="font-bold mb-1">{dataPoint.name}</p>
          <p className="text-slate-600">Jumlah: <span className="font-semibold text-blue-600">{new Intl.NumberFormat('id-ID').format(dataPoint.value)}</span></p>
          {total > 0 && <p className="text-slate-500">Persentase: <span className="font-semibold text-green-600">{percent}%</span></p>}
        </div>
      );
    }
    return null;
  };

  const injectTotal = (arr) => {
    const total = arr.reduce((acc, curr) => acc + curr.value, 0);
    return arr.map(item => ({ ...item, totalCount: total }));
  };

  if (loading) return <div className="flex-1 p-8 flex justify-center items-center text-slate-400"><Loader2 className="animate-spin mr-2"/>Loading Data...</div>;
  if (!data) return <div className="p-8 text-center text-slate-500">Data tidak tersedia.</div>;

  return (
    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-300 p-4 overflow-y-auto min-h-0">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          {selectedKec ? `Infografis: Kec. ${selectedKec}` : (selectedKab ? `Infografis: ${kabupatenName}` : "Infografis: Provinsi D.I. Yogyakarta")}
        </h3>
        <p className="text-sm text-slate-500">Statistik kepegawaian & diklat Tahun <strong>{selectedYear}</strong>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-4">
        {/* RANKING */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
          <h4 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide border-b pb-2">{data.ranking?.title || "Ranking"}</h4>
          <div className="space-y-4 overflow-y-auto flex-1 pr-1 max-h-[500px]">
            {data.ranking?.items?.length > 0 ? (
                data.ranking.items.map((item, index) => {
                  const val = Number(item.value);
                  const maxVal = Number(data.ranking.items[0]?.value) || 1;
                  return (
                    <div key={index} className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs shrink-0 ${index < 3 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>#{index + 1}</div>
                        <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700 truncate pr-2">{item.name}</span>
                            <span className="text-xs font-bold text-slate-500">{new Intl.NumberFormat('id-ID').format(val)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(val / maxVal) * 100}%` }}></div></div>
                        </div>
                    </div>
                  )
                })
            ) : <div className="text-center text-slate-400 text-sm mt-10">Belum ada data ranking</div>}
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Status Kepegawaian">
            {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={injectTotal(statusData)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({percent}) => `${(percent * 100).toFixed(0)}%`}>
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
                </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400">Data Kosong</div>}
          </ChartCard>

          <ChartCard title="PTK vs Alumni">
            {ptkAlumniData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={injectTotal(ptkAlumniData)} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="value" label={({percent}) => `${(percent * 100).toFixed(0)}%`}>
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
                </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400">Data Kosong</div>}
          </ChartCard>

          <div className="md:col-span-2">
            <ChartCard title="Persebaran Jabatan (Top 5)">
              {jabatanData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jabatanData} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                    <Tooltip formatter={(val) => new Intl.NumberFormat('id-ID').format(val)} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#666', fontSize: 11 }} />
                    </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400">Data Kosong</div>}
            </ChartCard>
          </div>

          <ChartCard title={`Tren Alumni per Triwulan (${selectedYear})`}>
             {triwulanData.some(d => d.alumni > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={triwulanData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip formatter={(val) => new Intl.NumberFormat('id-ID').format(val)} />
                    <Line type="monotone" dataKey="alumni" stroke="#ff7300" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
                </ResponsiveContainer>
             ) : <div className="h-full flex items-center justify-center text-slate-400">Belum ada data tren</div>}
          </ChartCard>

          <ChartCard title="Tren Alumni (5 Tahun Terakhir)">
            {tahunanData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tahunanData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip formatter={(val) => new Intl.NumberFormat('id-ID').format(val)} />
                    <Bar dataKey="alumni" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400">Data Kosong</div>}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA DASHBOARD ---
export default function DashboardContent() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [selectedKab, setSelectedKab] = useState(""); 
  const [selectedKec, setSelectedKec] = useState(""); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [wilayahData, setWilayahData] = useState([]);
  const [loadingWilayah, setLoadingWilayah] = useState(true);

  useEffect(() => {
    fetch("/data/yogya.geojson").then(res => res.json()).then(data => setGeoJsonData(data)).catch(console.error);
    fetch('/api/ref/wilayah').then(res => res.json()).then(data => { setWilayahData(data); setLoadingWilayah(false); }).catch(console.error);
  }, []);

  const listKecamatan = useMemo(() => {
    if (!selectedKab || wilayahData.length === 0) return [];
    // Gunakan CODE_TO_NAME untuk mencari nama kabupaten di array wilayahData
    const targetName = CODE_TO_NAME[selectedKab]; 
    return wilayahData.find(w => w.kabupaten === targetName)?.kecamatan || [];
  }, [wilayahData, selectedKab]);

  const handleKabupatenChange = (val) => {
    // Val dari dropdown adalah KODE (karena option value={code})
    setSelectedKab(val);
    setSelectedKec("");
  };

  const mapStyle = (feature) => {
    const kabCode = feature.properties.code.substring(0, 5);
    const kecName = feature.properties.name;
    const isSameKab = kabCode === selectedKab;
    let baseColor = "#cbd5e1";
    if (kabCode === "34.01") baseColor = "#3b82f6";
    else if (kabCode === "34.02") baseColor = "#10b981";
    else if (kabCode === "34.03") baseColor = "#eab308";
    else if (kabCode === "34.04") baseColor = "#f97316";
    else if (kabCode === "34.71") baseColor = "#ef4444";

    if (selectedKec && isSameKab && kecName.toUpperCase() === selectedKec.toUpperCase()) return { fillColor: "#4f46e5", weight: 3, color: "white", fillOpacity: 1 };
    if (selectedKab && isSameKab) return { fillColor: baseColor, weight: 1, color: "white", fillOpacity: 0.8 };
    if (selectedKab) return { fillColor: "#94a3b8", weight: 0.5, color: "white", fillOpacity: 0.2 };
    return { fillColor: baseColor, weight: 1, color: "white", fillOpacity: 0.6 };
  };

  const onEachFeature = (feature, layer) => {
    const kabCode = feature.properties.code.substring(0, 5);
    layer.bindTooltip(`${feature.properties.name}, ${getKabNameByCode(kabCode)}`, { sticky: true });
    layer.on({
      click: () => {
        const kecNameGeo = feature.properties.name;
        // Cari nama kecamatan yang cocok di API
        const targetKabName = CODE_TO_NAME[kabCode];
        const kabData = wilayahData.find(w => w.kabupaten === targetKabName);
        let finalKecName = kecNameGeo; 
        if (kabData?.kecamatan) {
            const match = kabData.kecamatan.find(k => k.toUpperCase() === kecNameGeo.toUpperCase());
            if (match) finalKecName = match;
        }
        setSelectedKab(kabCode); setSelectedKec(finalKecName); 
      },
      mouseover: (e) => { e.target.setStyle({ weight: 3, color: '#fff', fillOpacity: 0.9 }); e.target.bringToFront(); },
      mouseout: (e) => {
        if (!selectedKec || e.target.feature.properties.name.toUpperCase() !== selectedKec.toUpperCase()) e.target.setStyle({ weight: 1 });
      }
    });
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-white overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 h-[60%] shrink-0">
        <div className="flex-1 bg-slate-100 rounded-xl border-2 border-slate-300 relative overflow-hidden group">
          <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded shadow-sm border border-slate-200"><span className="text-sm font-bold">Peta Yogyakarta</span></div>
          <div className="w-full h-full bg-slate-200">
             {geoJsonData ? (
                <MapContainer   center={[-7.88, 110.45]} zoom={10} minZoom={9}  maxZoom={13} maxBounds={YOGYA_BOUNDS} maxBoundsViscosity={1.0}  className="w-full h-full z-0"  zoomControl={false}>
                  <GeoJSON key={JSON.stringify(geoJsonData) + selectedKab + selectedKec + wilayahData.length} data={geoJsonData} style={mapStyle} onEachFeature={onEachFeature} />
                </MapContainer>
             ) : (<div className="flex items-center justify-center h-full text-slate-400">Memuat Peta...</div>)}
          </div>
          {!selectedKab && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]"><div className="bg-white/60 px-4 py-2 rounded text-slate-700 font-medium backdrop-blur-sm border border-white/50 shadow-sm">Klik wilayah di peta atau gunakan filter</div></div>}
        </div>
        <div className="w-full lg:w-80 bg-slate-400/50 rounded-xl border-2 border-slate-400 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6"><Filter className="w-5 h-5"/><h2 className="font-bold text-lg">Filter Wilayah</h2></div>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
             
             {/* FILTER KABUPATEN */}
             <div className="space-y-2"><label className="text-sm font-semibold">Kabupaten / Kota</label>
               <select className="w-full p-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100" value={selectedKab} onChange={(e) => handleKabupatenChange(e.target.value)} disabled={loadingWilayah}>
                 <option value="">-- Semua Kabupaten --</option>
                 {wilayahData.map((item, idx) => {
                     // Pakai NAME_TO_CODE untuk mendapatkan value "34.xx"
                     const code = NAME_TO_CODE[item.kabupaten];
                     return (<option key={idx} value={code || item.kabupaten}>{item.kabupaten}</option>)
                 })}
               </select>
             </div>

             {/* FILTER KECAMATAN */}
             <div className="space-y-2"><label className="text-sm font-semibold">Kecamatan</label>
               <select className="w-full p-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-200 disabled:text-slate-500" value={selectedKec} onChange={(e) => setSelectedKec(e.target.value)} disabled={!selectedKab || listKecamatan.length === 0}>
                 <option value="">-- Semua Kecamatan --</option>
                 {listKecamatan.map((kecName, idx) => (<option key={idx} value={kecName}>{kecName}</option>))}
               </select>
               {!selectedKab && <p className="text-xs text-slate-600 italic">Pilih kabupaten terlebih dahulu.</p>}
             </div>

             {/* FILTER TAHUN */}
             <div className="space-y-2 border-t pt-4">
               <div className="flex items-center gap-2 mb-1"><CalendarRange className="w-4 h-4 text-slate-500"/><label className="text-sm font-semibold">Periode Tahun</label></div>
               <select className="w-full p-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  {YEAR_LIST.map(year => (<option key={year} value={year}>{year}</option>))}
               </select>
             </div>

             {(selectedKab || selectedKec) && <button onClick={() => { setSelectedKab(""); setSelectedKec(""); }} className="mt-4 w-full py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors text-sm font-medium">Reset Filter Wilayah</button>}
          </div>
        </div>
      </div>
      
      <DataSection selectedKab={selectedKab} selectedKec={selectedKec} selectedYear={selectedYear} kabupatenName={getKabNameByCode(selectedKab)} />
    </div>
  );
}