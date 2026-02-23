"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function useDiklatEdit(data, onRefresh) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...data });

  useEffect(() => {
    setEditData({ ...data });
  }, [data]);
  
  const handleSaveEdit = async () => {
    try {
      const {
        topic_name,
        sub_topic_name,
        sasaran_jenjang,
        sasaran_jabatan,
        moda,
        total_peserta,
        rumpun,
        ...restData
      } = editData;

      console.log("Data to be sent for update:", restData);

      const res = await fetch(`/api/diklat/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restData),
      });

      if (res.ok) {
        toast.success("Data berhasil diperbarui");
        setIsEditing(false);
        if (onRefresh) onRefresh(true);
      } else {
        toast.error("Gagal update data");
      }
    } catch {
      toast.error("Error koneksi");
    }
  };

  return {
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    handleSaveEdit,
  };
}
