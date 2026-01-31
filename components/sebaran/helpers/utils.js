import { COLORS } from "../../../lib/constants";

export const processData = (arr, colors = COLORS) => {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map((item, index) => ({
    name: item.name,
    value: Number(item.value),
    fill: colors[index % colors.length],
  }));
};

export const injectTotal = (arr = []) => {
  const total = arr.reduce((a, b) => a + b.value, 0);
  return arr.map((i) => ({ ...i, totalCount: total }));
};
