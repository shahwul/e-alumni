export default function PopupModal({ isOpen, children, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1337 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-6xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-800"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
