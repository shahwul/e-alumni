export function fetchAnalytics(params, signal) {
  const searchParams = new URLSearchParams(params).toString();
  console.log("Fetching analytics with params:", params);
  return fetch(`/api/dashboard/analytics?${searchParams}`, { signal }).then(
    (res) => {
      if (!res.ok) {
        throw new Error("Aborted by abort controller");
      }
      return res.json();
    },
  );
}
