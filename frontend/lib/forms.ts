import type { FieldDefinition, FieldValues } from "./contracts";

export function readFormValues(
  fields: FieldDefinition[],
  form: FormData,
): FieldValues {
  const values: FieldValues = {};
  for (const field of fields) {
    const raw = form.get(field.name);
    if (raw === null || raw === "") continue;
    const value = String(raw);
    if (field.kind === "number") {
      const number = Number(value);
      if (!Number.isFinite(number))
        throw new Error(`${field.label}: número inválido.`);
      values[field.name] = number;
    } else if (field.kind === "boolean") {
      if (value !== "true" && value !== "false")
        throw new Error(`${field.label}: valor inválido.`);
      values[field.name] = value === "true";
    } else if (field.kind === "array") {
      values[field.name] = field.options?.length
        ? form.getAll(field.name).map(String)
        : value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    } else values[field.name] = value;
  }
  return values;
}

export function fillRoute(
  route: string,
  params: Record<string, string>,
): string {
  return route.replace(/\[([^\]]+)\]/g, (_, key: string) => {
    if (!params[key]) throw new Error(`Informe ${key}.`);
    return encodeURIComponent(params[key]);
  });
}
