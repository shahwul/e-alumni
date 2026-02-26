import React from "react";
import RekapTable from "@/components/rekap/RekapTable";

export const metadata = {
    title: "E-Alumni",
    description: "Halaman rekapitulasi data PTK berdasarkan wilayah dan bentuk pendidikan",
};

export default function RekapPage() {
    return (
        <div className="flex-1 space-y-6 p-8 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Rekapitulasi PTK
                    </h2>
                    <p className="text-slate-500 mt-2">
                        Rangkuman jumlah Pendidik dan Tenaga Kependidikan berdasarkan jenjang wilayah terendah hingga satuan sekolah.
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <RekapTable />
            </div>
        </div>
    );
}
