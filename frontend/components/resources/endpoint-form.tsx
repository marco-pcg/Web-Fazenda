"use client";

import { useId, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldDefinition, FieldValues } from "@/lib/contracts";
import { readFormValues } from "@/lib/forms";

export type EndpointFormProps = {
  fields: FieldDefinition[];
  initialValues?: FieldValues;
  onSubmit?: (values: FieldValues) => Promise<void> | void;
  submitLabel?: string;
  destructive?: boolean;
  confirmation?: boolean;
  disabled?: boolean;
};
export function EndpointForm({
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = "Salvar",
  destructive = false,
  confirmation = false,
  disabled = false,
}: EndpointFormProps) {
  const id = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onSubmit || pending || disabled || (confirmation && !confirmed))
      return;
    const form = event.currentTarget;
    setPending(true);
    setError(null);
    try {
      await onSubmit(readFormValues(fields, new FormData(form)));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível concluir a operação.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5" aria-busy={pending}>
      <fieldset disabled={pending || disabled} className="space-y-5">
        {fields.map((field) => {
          const fieldId = `${id}-${field.name}`;
          const value = initialValues[field.name];
          const defaultValue = Array.isArray(value)
            ? value.join(", ")
            : value === undefined
              ? ""
              : String(value);
          const select =
            field.kind === "select" ||
            field.kind === "boolean" ||
            (field.kind === "array" && !!field.options?.length);
          const options =
            field.kind === "boolean"
              ? ["true", "false"]
              : (field.options ?? []);
          return (
            <div className="space-y-2" key={field.name}>
              <Label htmlFor={fieldId}>
                {field.label}
                {field.required && <span aria-hidden="true"> *</span>}
              </Label>
              {select ? (
                <select
                  id={fieldId}
                  name={field.name}
                  required={field.required}
                  defaultValue={
                    field.kind === "array"
                      ? Array.isArray(value)
                        ? value
                        : []
                      : defaultValue
                  }
                  multiple={field.kind === "array"}
                  aria-describedby={`${fieldId}-help`}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {field.kind !== "array" && (
                    <option value="">Selecione</option>
                  )}
                  {options.map((option) => (
                    <option key={String(option)} value={String(option)}>
                      {field.kind === "boolean"
                        ? option === "true"
                          ? "Sim"
                          : "Não"
                        : String(option)}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={fieldId}
                  name={field.name}
                  type={field.kind === "array" ? "text" : field.kind}
                  defaultValue={defaultValue}
                  required={field.required}
                  min={field.min}
                  max={field.max}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                  step={field.step}
                  autoComplete={
                    field.kind === "password"
                      ? "off"
                      : field.kind === "email"
                        ? "email"
                        : undefined
                  }
                  aria-describedby={`${fieldId}-help`}
                  pattern={
                    field.format === "uuid" && field.kind !== "array"
                      ? "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
                      : undefined
                  }
                />
              )}
              <p
                id={`${fieldId}-help`}
                className="text-xs text-muted-foreground"
              >
                {field.description}
                {field.kind === "array" && !field.options?.length
                  ? " Separe os valores por vírgulas."
                  : ""}
                {!field.required ? " Opcional." : ""}
              </p>
            </div>
          );
        })}
        {confirmation && (
          <div className="flex items-center gap-2">
            <input
              id={`${id}-confirm`}
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            <Label htmlFor={`${id}-confirm`}>
              Confirmo que desejo realizar esta operação.
            </Label>
          </div>
        )}
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {!onSubmit && (
        <p className="text-sm text-muted-foreground">
          Esta operação ainda não está disponível.
        </p>
      )}
      <Button
        type="submit"
        variant={destructive ? "destructive" : "default"}
        disabled={
          !onSubmit || pending || disabled || (confirmation && !confirmed)
        }
      >
        {pending && (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        )}
        {pending ? "Aguarde…" : submitLabel}
      </Button>
    </form>
  );
}
