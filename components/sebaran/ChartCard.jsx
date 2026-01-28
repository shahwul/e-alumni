export default function ChartCard({
  title,
  children,
  height = 400,
  className = "",
}) {
  return (
    <section
      className={`bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col ${className}`}
    >
      {title && (
        <header className="px-4 pt-4 pb-2">
          <h5 className="text-sm font-semibold text-slate-600">
            {title}
          </h5>
        </header>
      )}

      <div
        className="px-4 pb-4 relative"
        style={{ height: `${height}px` }}
      >
        {children}
      </div>
    </section>
  );
}
