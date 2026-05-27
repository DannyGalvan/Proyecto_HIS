import { describe, expect, it } from "vitest";

import { useVitalSignAlerts } from "../useVitalSignAlerts";

describe("useVitalSignAlerts", () => {
  it("returns empty array when all values are normal", () => {
    const alerts = useVitalSignAlerts({
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      temperature: 36.5,
      heartRate: 72,
    });
    expect(alerts).toEqual([]);
  });

  it("detects Hipotensión (systolic < 90)", () => {
    const alerts = useVitalSignAlerts({ bloodPressureSystolic: 85 });
    expect(alerts).toContain("Hipotensión");
  });

  it("detects Hipertensión (systolic > 140)", () => {
    const alerts = useVitalSignAlerts({ bloodPressureSystolic: 160 });
    expect(alerts).toContain("Hipertensión");
  });

  it("detects Presión diastólica baja (< 60)", () => {
    const alerts = useVitalSignAlerts({ bloodPressureDiastolic: 50 });
    expect(alerts).toContain("Presión diastólica baja");
  });

  it("detects Presión diastólica alta (> 90)", () => {
    const alerts = useVitalSignAlerts({ bloodPressureDiastolic: 95 });
    expect(alerts).toContain("Presión diastólica alta");
  });

  it("detects Hipotermia (temperature < 36)", () => {
    const alerts = useVitalSignAlerts({ temperature: 35.5 });
    expect(alerts).toContain("Hipotermia");
  });

  it("detects Fiebre (temperature > 37.5)", () => {
    const alerts = useVitalSignAlerts({ temperature: 38.5 });
    expect(alerts).toContain("Fiebre");
  });

  it("detects Bradicardia (heartRate < 60)", () => {
    const alerts = useVitalSignAlerts({ heartRate: 50 });
    expect(alerts).toContain("Bradicardia");
  });

  it("detects Taquicardia (heartRate > 100)", () => {
    const alerts = useVitalSignAlerts({ heartRate: 110 });
    expect(alerts).toContain("Taquicardia");
  });

  it("returns empty array when all values are null", () => {
    const alerts = useVitalSignAlerts({
      bloodPressureSystolic: null,
      bloodPressureDiastolic: null,
      temperature: null,
      heartRate: null,
    });
    expect(alerts).toEqual([]);
  });

  it("can return multiple alerts simultaneously", () => {
    const alerts = useVitalSignAlerts({
      bloodPressureSystolic: 160,
      temperature: 39,
      heartRate: 110,
    });
    expect(alerts).toContain("Hipertensión");
    expect(alerts).toContain("Fiebre");
    expect(alerts).toContain("Taquicardia");
  });
});
