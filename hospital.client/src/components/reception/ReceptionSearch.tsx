import { useState } from "react";
import { Button } from "@heroui/react";
import { toast } from "@heroui/react";

interface ReceptionSearchProps {
  onSearch: (query: string, type: "dpi" | "id") => void;
}

export function ReceptionSearch({ onSearch }: ReceptionSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<"dpi" | "id">("dpi");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast.danger("Ingrese un número de cita o DPI para buscar");
      return;
    }
    onSearch(searchValue.trim(), searchType);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
      <form className="flex flex-col md:flex-row gap-3" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              searchType === "dpi"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
            onClick={() => setSearchType("dpi")}
          >
            Por DPI
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              searchType === "id"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
            onClick={() => setSearchType("id")}
          >
            Por No. Cita
          </button>
        </div>
        <input
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            searchType === "dpi"
              ? "Ingrese DPI del paciente (13 dígitos)"
              : "Ingrese número de cita"
          }
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Button type="submit" variant="primary" className="px-6">
          <i className="bi bi-search mr-2" /> Buscar
        </Button>
      </form>
    </div>
  );
}
