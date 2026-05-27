import { describe, expect, it, vi } from "vitest";
import { ZodError, ZodIssueCode } from "zod";

import {
    constructFilters,
    copyToClipboard,
    customToFormData,
    dataFormatter,
    dateNow,
    errorObjectToString,
    handleOneLevelZodError,
    mapValidationFailuresToFieldErrors,
    minDateMaxDate,
    toAllOperations,
    toCamelCase,
    today,
    toFormatDate,
    toFormatTime,
    validationFailureToString
} from "../converted";

describe("toCamelCase", () => {
  it("converts PascalCase to camelCase", () => {
    expect(toCamelCase("HelloWorld")).toBe("helloWorld");
  });

  it("converts single word", () => {
    expect(toCamelCase("Name")).toBe("name");
  });

  it("handles already camelCase", () => {
    expect(toCamelCase("alreadyCamel")).toBe("alreadyCamel");
  });

  it("handles empty string", () => {
    expect(toCamelCase("")).toBe("");
  });
});

describe("dataFormatter", () => {
  it("formats number with Q prefix and thousand separators", () => {
    expect(dataFormatter(1000)).toBe("Q1,000");
  });

  it("formats zero", () => {
    expect(dataFormatter(0)).toBe("Q0");
  });

  it("formats large numbers", () => {
    expect(dataFormatter(1000000)).toBe("Q1,000,000");
  });
});

describe("toAllOperations", () => {
  it("flattens operations from multiple authorization groups", () => {
    const authorizations = [
      { operations: [{ id: 1, name: "op1" }, { id: 2, name: "op2" }] },
      { operations: [{ id: 3, name: "op3" }] },
    ] as any;
    const result = toAllOperations(authorizations);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(1);
    expect(result[2].id).toBe(3);
  });

  it("returns empty array for empty input", () => {
    expect(toAllOperations([])).toEqual([]);
  });
});

describe("toFormatTime", () => {
  it("formats ISO date string to HH:MM", () => {
    const result = toFormatTime("2024-06-15T14:05:00");
    expect(result).toBe("14:05");
  });

  it("zero-pads single-digit hours and minutes", () => {
    const result = toFormatTime("2024-06-15T09:03:00");
    expect(result).toBe("09:03");
  });
});

describe("toFormatDate", () => {
  it("formats ISO date string to yyyy-MM-dd", () => {
    expect(toFormatDate("2024-06-15T14:30:00")).toBe("2024-06-15");
  });

  it("handles date-only string (10 chars) by appending T06:00:00", () => {
    expect(toFormatDate("2024-01-05")).toBe("2024-01-05");
  });

  it("zero-pads single-digit day and month", () => {
    expect(toFormatDate("2024-01-05T00:00:00")).toBe("2024-01-05");
  });
});

describe("dateNow", () => {
  it("returns today's date in yyyy-MM-dd format", () => {
    const result = dateNow();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("today", () => {
  it("returns a Date object", () => {
    const result = today();
    expect(result).toBeInstanceOf(Date);
  });
});

describe("minDateMaxDate", () => {
  it("returns minDate and maxDate strings in yyyy-MM-dd format", () => {
    const { minDate, maxDate } = minDateMaxDate();
    expect(minDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(maxDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("maxDate is today", () => {
    const { maxDate } = minDateMaxDate();
    const todayStr = new Date().toISOString().substring(0, 10);
    expect(maxDate).toBe(todayStr);
  });

  it("accepts custom months parameter", () => {
    const { minDate } = minDateMaxDate(1);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const expected = oneMonthAgo.toISOString().substring(0, 10);
    expect(minDate).toBe(expected);
  });
});

describe("handleOneLevelZodError", () => {
  it("converts ZodError issues to ErrorObject", () => {
    const zodError = new ZodError([
      {
        code: ZodIssueCode.too_small,
        minimum: 1,
        inclusive: true,
        origin: "string",
        path: ["name"],
        message: "Required",
      },
      {
        code: ZodIssueCode.too_small,
        minimum: 6,
        inclusive: true,
        origin: "string",
        path: ["password"],
        message: "Too short",
      },
    ]);
    const result = handleOneLevelZodError(zodError);
    expect(result).toEqual({ name: "Required", password: "Too short" });
  });
});

describe("validationFailureToString", () => {
  it("converts validation failures to comma-separated string", () => {
    const errors = [
      { propertyName: "Name", errorMessage: "Required", attemptedValue: {}, customerState: {}, errorCode: "NotEmpty" },
      { propertyName: "Email", errorMessage: "Invalid", attemptedValue: {}, customerState: {}, errorCode: "EmailValidator" },
    ];
    expect(validationFailureToString(errors)).toBe(
      "Name: Required, Email: Invalid",
    );
  });

  it("returns empty string for null", () => {
    expect(validationFailureToString(null)).toBe("");
  });
});

describe("errorObjectToString", () => {
  it("converts error object to string", () => {
    const errors = { name: "Required", email: "Invalid" };
    expect(errorObjectToString(errors)).toBe("name: Required, email: Invalid");
  });

  it("handles array values", () => {
    const errors = { name: ["Error 1", "Error 2"] };
    expect(errorObjectToString(errors)).toBe("name: Error 1, Error 2");
  });

  it("returns empty string for undefined", () => {
    expect(errorObjectToString(undefined)).toBe("");
  });
});

describe("mapValidationFailuresToFieldErrors", () => {
  it("maps PropertyName to camelCase keys", () => {
    const errors = [
      { propertyName: "UserName", errorMessage: "Required", attemptedValue: {}, customerState: {}, errorCode: "NotEmpty" },
      { propertyName: "Email", errorMessage: "Invalid", attemptedValue: {}, customerState: {}, errorCode: "EmailValidator" },
    ];
    const result = mapValidationFailuresToFieldErrors(errors);
    expect(result).toEqual({ userName: "Required", email: "Invalid" });
  });

  it("returns empty object for null", () => {
    const result = mapValidationFailuresToFieldErrors(null);
    expect(result).toEqual({});
  });

  it("returns undefined for empty array (no errors)", () => {
    const result = mapValidationFailuresToFieldErrors([]);
    expect(result).toBeUndefined();
  });
});

describe("constructFilters", () => {
  it("removes leading AND prefix", () => {
    expect(constructFilters(" AND name == 'test'")).toBe("name == 'test'");
  });

  it("returns string as-is if no leading AND", () => {
    expect(constructFilters("name == 'test'")).toBe("name == 'test'");
  });
});

describe("copyToClipboard", () => {
  it("calls navigator.clipboard.writeText", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    await copyToClipboard("hello");
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("handles clipboard error gracefully", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await copyToClipboard("hello");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("customToFormData", () => {
  it("appends simple string values", () => {
    const form = customToFormData({ name: "test" });
    expect(form.get("name")).toBe("test");
  });

  it("appends number values as strings", () => {
    const form = customToFormData({ age: 25 });
    expect(form.get("age")).toBe("25");
  });

  it("appends boolean values as strings", () => {
    const form = customToFormData({ active: true });
    expect(form.get("active")).toBe("true");
  });

  it("skips null and undefined values", () => {
    const form = customToFormData({ a: null, b: undefined, c: "value" });
    expect(form.get("a")).toBeNull();
    expect(form.get("b")).toBeNull();
    expect(form.get("c")).toBe("value");
  });

  it("handles nested objects with dot notation", () => {
    const form = customToFormData({ address: { city: "Guatemala" } });
    expect(form.get("address.city")).toBe("Guatemala");
  });

  it("handles arrays with indexed keys", () => {
    const form = customToFormData({ items: ["a", "b", "c"] });
    expect(form.get("items[0]")).toBe("a");
    expect(form.get("items[1]")).toBe("b");
    expect(form.get("items[2]")).toBe("c");
  });

  it("handles Date values by recursing into their properties", () => {
    const date = new Date("2024-06-15T10:00:00Z");
    const form = customToFormData({ createdAt: date as unknown });
    // Date is treated as a plain object and recursed into (its properties are enumerated)
    // The function doesn't reach appendSimple for Date at top level because isPlainObject matches first
    // This is the actual behavior — Date objects get recursed
    expect(form.get("createdAt")).toBeNull();
  });

  it("handles File values", () => {
    const file = new File(["content"], "test.pdf", {
      type: "application/pdf",
    });
    const form = customToFormData({ document: file });
    expect(form.get("document")).toBe(file);
  });

  it("handles array of files with same key", () => {
    const file1 = new File(["a"], "a.pdf", { type: "application/pdf" });
    const file2 = new File(["b"], "b.pdf", { type: "application/pdf" });
    const form = customToFormData({ files: [file1, file2] });
    const all = form.getAll("files");
    expect(all).toHaveLength(2);
  });

  it("handles mixed array with file items", () => {
    const file = new File(["a"], "a.pdf", { type: "application/pdf" });
    const form = customToFormData({ items: [file, "text"] });
    // File gets appended with base key, text gets indexed key
    const files = form.getAll("items");
    expect(files.length).toBeGreaterThanOrEqual(1);
  });

  it("handles mixed array with nested objects", () => {
    const form = customToFormData({
      items: [{ name: "item1" }, { name: "item2" }],
    });
    expect(form.get("items[0].name")).toBe("item1");
    expect(form.get("items[1].name")).toBe("item2");
  });
});
