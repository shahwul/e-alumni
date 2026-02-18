"use client";

import { useEffect, useState } from "react";
import DiklatCard from "@/components/input-data/DiklatCard/DiklatCard";
import AddDiklatForm from "@/components/input-data/AddDiklatForm";
import InputDataHeader from "@/components/input-data/list/InputDataHeader";
import InputDataSearch from "@/components/input-data/list/InputDataSearch";

export default function InputDataPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const res = await fetch(`/api/diklat?search=${search}&limit=50`);
    const json = await res.json();
    setData(json.data || []);
  };

  useEffect(() => {
    if (!isAdding) fetchData();
  }, [search, isAdding]);

  if (isAdding) {
    return (
      <AddDiklatForm
        onBack={() => setIsAdding(false)}
        onSuccess={() => { setIsAdding(false); fetchData(); }}
      />
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <InputDataHeader onAdd={() => setIsAdding(true)} />
      <InputDataSearch search={search} setSearch={setSearch} />

      <div className="space-y-4">
        {data.map((item) => (
          <DiklatCard
            key={item.id}
            data={item}
            onRefresh={fetchData}
          />
        ))}
      </div>
    </div>
  );
}
