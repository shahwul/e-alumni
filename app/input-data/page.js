import { AddDiklatForm } from "@/components/input-data/AddDiklatForm";

export default function TambahDiklatPage() {
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tambah Data Pelatihan</h1>
        <p className="text-slate-500">Silakan isi formulir di bawah untuk mendaftarkan diklat baru.</p>
      </div>
      <AddDiklatForm />
    </div>
  );
}