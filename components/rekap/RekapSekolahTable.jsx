"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const TINGKAT = {
    KABUPATEN: "kabupaten",
    KECAMATAN: "kecamatan",
    SEKOLAH: "sekolah"
};

export default function RekapSekolahTable() {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);

    // View state history for drill-down navigation
    const [history, setHistory] = useState([
        { tingkat: TINGKAT.KABUPATEN, id: null, name: "Semua Wilayah Kabupaten" },
    ]);

    const currentView = history[history.length - 1];

    const fetchData = async (tingkat, parentCode) => {
        setLoading(true);
        try {
            let url = `/api/rekap-sekolah?tingkat=${tingkat}`;
            if (parentCode) {
                url += `&parent_code=${parentCode}`;
            }
            const res = await fetch(url);
            const json = await res.json();
            if (res.ok) {
                setData(json.data || []);
                setColumns(json.columns || []);
            } else {
                console.error("Failed to fetch rekap sekolah:", json);
            }
        } catch (error) {
            console.error("Error fetching:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentView.tingkat, currentView.id);
    }, [currentView]);

    const handleRowClick = (row) => {
        if (currentView.tingkat === TINGKAT.KABUPATEN) {
            setHistory([
                ...history,
                { tingkat: TINGKAT.KECAMATAN, id: row.id, name: row.wilayah },
            ]);
        } else if (currentView.tingkat === TINGKAT.KECAMATAN) {
            setHistory([
                ...history,
                { tingkat: TINGKAT.SEKOLAH, id: row.id, name: row.wilayah },
            ]);
        }
        // Jika sekolah, tidak ada drill-down lagi
    };

    const handleBack = () => {
        if (history.length > 1) {
            setHistory(history.slice(0, -1));
        }
    };

    // Helper untuk value per kolom bentuk pendidikan
    const getDetail = (row, bentuk) => {
        if (row && row.details && typeof row.details[bentuk] !== "undefined") {
            return row.details[bentuk];
        }
        return 0;
    };

    // Kalkulasi Footer Totals
    const calculateTotal = (key) => data.reduce((acc, curr) => acc + (curr[key] || 0), 0);
    const calculateDetailTotal = (bentuk) =>
        data.reduce((acc, curr) => acc + getDetail(curr, bentuk), 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600 mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                {history.length > 1 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="mr-2 h-8 w-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <div className="flex items-center space-x-2 font-medium">
                    {history.map((step, idx) => (
                        <React.Fragment key={idx}>
                            <span
                                className={`${idx === history.length - 1 ? "text-blue-600" : "text-slate-500"
                                    }`}
                            >
                                {step.name}
                            </span>
                            {idx < history.length - 1 && (
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-100 hover:bg-slate-100 uppercase text-slate-700 text-xs text-center border-b">
                            <TableHead className="px-4 py-3 border-r text-center w-12 align-middle">
                                No
                            </TableHead>
                            <TableHead className="px-4 py-3 border-r min-w-[200px] align-middle text-slate-700">
                                Wilayah
                            </TableHead>
                            <TableHead className="px-4 py-2 text-center border-r align-middle bg-slate-200/50">
                                Total Sekolah
                            </TableHead>
                            {columns.map((col, idx) => (
                                <TableHead
                                    key={col}
                                    className={`px-4 py-2 text-center align-middle ${idx !== columns.length - 1 ? "border-r" : ""} ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                                >
                                    {col}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3 + columns.length} className="px-6 py-10 text-center text-slate-500">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3 + columns.length} className="px-6 py-10 text-center text-slate-500">
                                    Data tidak ditemukan
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, i) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => handleRowClick(row)}
                                    className={`${currentView.tingkat !== TINGKAT.SEKOLAH
                                        ? "cursor-pointer hover:bg-blue-50"
                                        : "hover:bg-slate-50"
                                        }`}
                                >
                                    <TableCell className="px-4 py-3 text-center border-r">{i + 1}</TableCell>
                                    <TableCell className="px-4 py-3 font-medium text-blue-600 border-r min-w-[200px] whitespace-normal">
                                        {row.wilayah}
                                    </TableCell>

                                    {/* Total Cells (Keseluruhan Sekolah) */}
                                    <TableCell className="px-3 py-3 text-center font-semibold border-r bg-slate-50/50">
                                        {row.total_jml}
                                    </TableCell>

                                    {/* Dynamic Columns Cells (Total per Bentuk Pend) */}
                                    {columns.map((col, idx) => {
                                        const bgClass = idx % 2 === 0 ? "" : "bg-slate-50/30";
                                        return (
                                            <TableCell
                                                key={col}
                                                className={`px-3 py-3 text-center ${idx !== columns.length - 1 ? "border-r" : ""} ${bgClass}`}
                                            >
                                                {getDetail(row, col)}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    {!loading && data.length > 0 && (
                        <TableFooter className="bg-slate-100 font-bold border-t-2 border-slate-300">
                            <TableRow className="hover:bg-slate-100">
                                <TableCell colSpan={2} className="px-4 py-3 text-center border-r border-slate-300 align-middle text-slate-800">
                                    Grand Total
                                </TableCell>

                                {/* Total Grand Total */}
                                <TableCell className="px-3 py-3 text-center border-r border-slate-300 align-middle">
                                    {calculateTotal("total_jml")}
                                </TableCell>

                                {/* Dynamic Columns Grand Totals */}
                                {columns.map((col, idx) => (
                                    <TableCell
                                        key={col}
                                        className={`px-3 py-3 text-center align-middle border-slate-300 ${idx !== columns.length - 1 ? "border-r" : ""}`}
                                    >
                                        {calculateDetailTotal(col)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>
        </div>
    );
}
