import { Button } from "@heroui/react";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import type { DispenseResponse } from "../../types/DispenseResponse";

export function DispenseButton({ data }: { readonly data: DispenseResponse }) {
  const navigate = useNavigate();
  const handleClick = useCallback(
    () => navigate(`/dispense/${data.id}`),
    [navigate, data.id],
  );
  return (
    <Button
      isIconOnly
      aria-label="Ver detalle"
      size="sm"
      variant="primary"
      onClick={handleClick}
    >
      <i className="bi bi-eye" />
    </Button>
  );
}

DispenseButton.displayName = "DispenseButton";
