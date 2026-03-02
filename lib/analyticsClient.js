export function fetchAnalytics(params, signal) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

  const searchParams = new URLSearchParams(cleaned).toString();

  return fetch(`/api/dashboard/analytics?${searchParams}`, { signal, headers: { 'x-api-key': process.env.NEXT_PUBLIC_FRONTEND_API_KEY } })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Request failed");
      }
      return res.json();
    });
}
