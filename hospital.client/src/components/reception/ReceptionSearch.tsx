import { Button, toast } from "@heroui/react";
import { useCallback, useState } from "react";

interface ReceptionSearchProps {
  readonly onSearch: (query: string, type: "dpi" | "id") => void;
}

export function ReceptionSearch({ onSearch }: ReceptionSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<"dpi" | "id">("dpi");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchValue.trim()) {
        toast.danger("Ingrese un número de cita o DPI para buscar");
        return;
      }
      onSearch(searchValue.trim(), searchType);
    },
    [searchValue, searchType, onSearch],
  );

  const handleSetDpi = useCallback(() => setSearchType("dpi"), []);
  const handleSetId = useCallback(() => setSearchType("id"), []);
  const handleSearchValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value),
    [],
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
      <form className="flex flex-col md:flex-row gap-3" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              searchType === "dpi"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
            type="button"
            onClick={handleSetDpi}
          >
            Por DPI
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              searchType === "id"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
            type="button"
            onClick={handleSetId}
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
          onChange={handleSearchValueChange}
        />
        <Button className="px-6" type="submit" variant="primary">
          <i className="bi bi-search mr-2" /> Buscar
        </Button>
      </form>
    </div>
  );
}
