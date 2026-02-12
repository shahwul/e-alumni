// components/list-peserta/usePesertaLogic.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function usePesertaLogic(diklatId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State Editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // State Validasi Live
  const [validatingField, setValidatingField] = useState(null);
  const [validationStatus, setValidationStatus] = useState({
    nik: { isValid: true, msg: "" },
    npsn: { isValid: true, msg: "" }
  });

  // --- FETCH DATA ---
  const fetchPeserta = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/input-data/peserta?diklat_id=${diklatId}&search=${search}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [diklatId, search]);

  useEffect(() => {
    const timer = setTimeout(fetchPeserta, 500);
    return () => clearTimeout(timer);
  }, [fetchPeserta]);

  // --- VALIDATION LOGIC ---
  const validateToServer = async (field, value) => {
    setValidatingField(field);
    const payload = {
        peserta: [{
            NIK: field === 'nik' ? value : editForm.nik,
            NPSN: field === 'npsn' ? value : editForm.npsn,
            Nama: editForm.nama_peserta,
            _tempId: 1
        }]
    };

    try {
        const res = await fetch("/api/input-data/validate", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        const result = json.data[0];

        if (field === 'npsn') {
            if (result.db_data && result.db_data.sekolah) {
                setEditForm(prev => ({ ...prev, nama_sekolah: result.db_data.sekolah }));
                setValidationStatus(prev => ({ ...prev, npsn: { isValid: true, msg: "Valid" } }));
            } else {
                setEditForm(prev => ({ ...prev, nama_sekolah: "" }));
                setValidationStatus(prev => ({ ...prev, npsn: { isValid: false, msg: "NPSN Tidak Ditemukan" } }));
            }
        }

        if (field === 'nik') {
            if (result.db_data && result.db_data.nama) {
                setValidationStatus(prev => ({ ...prev, nik: { isValid: true, msg: `Terdaftar: ${result.db_data.nama}` } }));
            } else {
                setValidationStatus(prev => ({ ...prev, nik: { isValid: false, msg: "NIK Tidak Ada di Database PTK" } }));
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        setValidatingField(null);
    }
  };

  // Debounce Effects
  useEffect(() => {
    if (!editingId || !editForm.nik) return;
    if (editForm.nik.length < 16) {
        setValidationStatus(prev => ({ ...prev, nik: { isValid: false, msg: "Min 16 digit" } }));
        return;
    }
    const timer = setTimeout(() => validateToServer('nik', editForm.nik), 800);
    return () => clearTimeout(timer);
  }, [editForm.nik, editingId]);

  useEffect(() => {
    if (!editingId || !editForm.npsn) return;
    if (editForm.npsn.length < 8) {
        setValidationStatus(prev => ({ ...prev, npsn: { isValid: false, msg: "Min 8 digit" } }));
        setEditForm(prev => ({ ...prev, nama_sekolah: "" }));
        return;
    }
    const timer = setTimeout(() => validateToServer('npsn', editForm.npsn), 800);
    return () => clearTimeout(timer);
  }, [editForm.npsn, editingId]);

  // --- ACTIONS ---
  const handleEditClick = (peserta) => {
    setEditingId(peserta.id);
    setEditForm({ ...peserta });
    setValidationStatus({ nik: { isValid: true, msg: "" }, npsn: { isValid: true, msg: "" } });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!validationStatus.nik.isValid || !validationStatus.npsn.isValid || !editForm.nama_sekolah) {
        toast.error("Perbaiki data invalid sebelum menyimpan");
        return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/input-data/peserta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();

      if (res.ok) {
        toast.success("Data berhasil diperbarui");
        setEditingId(null);
        setData(prev => prev.map(item => item.id === editForm.id ? editForm : item));
      } else {
        toast.error(json.error || "Gagal update data");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const oldData = [...data];
    setData(prev => prev.filter(item => item.id !== id));
    try {
      const res = await fetch(`/api/input-data/peserta?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Peserta dihapus permanen");
      } else {
        throw new Error("Gagal hapus");
      }
    } catch (e) {
      setData(oldData);
      toast.error("Gagal menghapus data");
    }
  };

  return {
    data, loading, search, setSearch,
    editingId, editForm, setEditForm, isSaving,
    validationStatus, validatingField,
    handleEditClick, handleCancelEdit, handleSaveEdit, handleDelete
  };
}