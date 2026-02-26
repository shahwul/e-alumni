import React from "react";
import RekapSekolahTable from "@/components/rekap/RekapSekolahTable";

export const metadata = {
    title: "E-Alumni",
    description: "Halaman rekapitulasi jumlah satuan pendidikan berdasarkan bentuk pendidikan dan wilayah",
};

export default function RekapSekolahPage() {
    return (
        <div className="flex-1 space-y-6 p-8 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Rekapitulasi Satuan Pendidikan (Sekolah)
                    </h2>
                    <p className="text-slate-500 mt-2">
                        Rangkuman total sekolah (satuan pendidikan) diurutkan berdasarkan bentuk pendidikan per jenjang wilayah.
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <RekapSekolahTable />
            </div>
        </div>
    );
}
