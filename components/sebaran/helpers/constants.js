export const YOGYA_BOUNDS = [
  [-8.20, 110.00], // Southwest
  [-7.50, 110.80], // Northeast
];

export const CODE_TO_NAME = {
  "34.01": "KULON PROGO",
  "34.02": "BANTUL",
  "34.03": "GUNUNGKIDUL",
  "34.04": "SLEMAN",
  "34.71": "KOTA YOGYAKARTA",
};

export const NAME_TO_CODE = {
  "KULON PROGO": "34.01",
  "BANTUL": "34.02",
  "GUNUNGKIDUL": "34.03",
  "SLEMAN": "34.04",
  "KOTA YOGYAKARTA": "34.71",
};

export const KAB_COLORS = {
  "34.01": "#3b82f6",
  "34.02": "#10b981",
  "34.03": "#eab308",
  "34.04": "#f97316",
  "34.71": "#ef4444",
};

export const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
];

const currentYear = new Date().getFullYear();
export const YEAR_LIST = Array.from({ length: 6 }, (_, i) => currentYear - i);