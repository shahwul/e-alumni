export const YOGYA_BOUNDS = [
  [-8.2, 110.0], // Southwest
  [-7.5, 110.8], // Northeast
];

export const KAB_CODE_TO_NAME = {
  34.01: "KULON PROGO",
  34.02: "BANTUL",
  34.03: "GUNUNGKIDUL",
  34.04: "SLEMAN",
  34.71: "KOTA YOGYAKARTA",
};

export const KAB_NAME_TO_CODE = {
  "KULON PROGO": "34.01",
  BANTUL: "34.02",
  GUNUNGKIDUL: "34.03",
  SLEMAN: "34.04",
  "KOTA YOGYAKARTA": "34.71",
};

export const KAB_COLORS = {
  34.01: "#3b82f6",
  34.02: "#10b981",
  34.03: "#eab308",
  34.04: "#f97316",
  34.71: "#ef4444",
};

export const METRIC_OPTIONS = [
  { value: "ptk", label: "PTK (Total)" },
  { value: "alumni", label: "Alumni" },
  { value: "untrained", label: "Belum Pelatihan" },
];

export const GRAIN_OPTIONS = [
  { value: "year", label: "Tahunan" },
  { value: "quarter", label: "Triwulan" },
  { value: "month", label: "Bulanan" },
];

export const GROUP_OPTIONS = [
  { value: "kabupaten", label: "Kabupaten" },
  { value: "kecamatan", label: "Kecamatan" },
  { value: "jabatan_ptk", label: "Jabatan PTK" },
  { value: "bentuk_pendidikan", label: "Jenjang" },
];

export const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const currentYear = new Date().getFullYear();
export const YEAR_LIST = Array.from({ length: 6 }, (_, i) => currentYear - i);
