import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EndpointForm } from "@/components/resources/endpoint-form";
import { PaginatedContent } from "@/components/shared/paginated-content";
import {
  ContextProvider,
  PermissionGate,
} from "@/components/providers/context-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { fillRoute, readFormValues } from "@/lib/forms";
import type { FieldDefinition } from "@/lib/contracts";

const fields: FieldDefinition[] = [
  {
    name: "quantidade",
    label: "Quantidade",
    kind: "number",
    required: true,
    min: 1,
  },
  { name: "ativo", label: "Ativo", kind: "boolean", required: false },
  {
    name: "permissoes_ids",
    label: "Permissões",
    kind: "array",
    required: false,
  },
  { name: "descricao", label: "Descrição", kind: "text", required: false },
];
describe("form payloads", () => {
  it("preserves false and zero, omits absent optionals and splits arrays", () => {
    const data = new FormData();
    data.set("quantidade", "0");
    data.set("ativo", "false");
    data.set("permissoes_ids", "a, b, ,c");
    expect(readFormValues(fields, data)).toEqual({
      quantidade: 0,
      ativo: false,
      permissoes_ids: ["a", "b", "c"],
    });
  });
  it("rejects invalid numbers", () => {
    const data = new FormData();
    data.set("quantidade", "invalid");
    expect(() => readFormValues(fields, data)).toThrow("número inválido");
  });
  it("encodes path parameters and refuses missing ones", () => {
    expect(
      fillRoute("/usuarios/email/[email]", { email: "a+b@example.com" }),
    ).toBe("/usuarios/email/a%2Bb%40example.com");
    expect(() => fillRoute("/turmas/[id]", {})).toThrow("Informe id");
  });
});
describe("EndpointForm", () => {
  it("preserves multiple selected enum values as a DTO array", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    render(
      <EndpointForm
        fields={[
          {
            name: "estacoes",
            label: "Estações",
            kind: "array",
            required: true,
            options: ["primavera", "verao", "outono", "inverno"],
          },
        ]}
        onSubmit={submit}
      />,
    );
    await user.selectOptions(screen.getByLabelText(/Estações/), [
      "primavera",
      "verao",
    ]);
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(submit).toHaveBeenCalledWith({ estacoes: ["primavera", "verao"] });
  });
  it("does not pretend to save before an API handler is supplied", () => {
    render(<EndpointForm fields={fields} />);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });
  it("submits typed values and displays handler errors", async () => {
    const user = userEvent.setup();
    const submit = vi.fn().mockRejectedValue(new Error("Sem permissão"));
    render(<EndpointForm fields={fields} onSubmit={submit} />);
    await user.type(screen.getByLabelText(/Quantidade/), "2");
    await user.selectOptions(screen.getByLabelText("Ativo"), "false");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(submit).toHaveBeenCalledWith({ quantidade: 2, ativo: false });
    expect(await screen.findByRole("alert")).toHaveTextContent("Sem permissão");
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });
  it("requires confirmation for a destructive operation", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    render(
      <EndpointForm
        fields={[]}
        confirmation
        destructive
        submitLabel="Excluir"
        onSubmit={submit}
      />,
    );
    expect(screen.getByRole("button", { name: "Excluir" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(submit).toHaveBeenCalledWith({});
  });
  it("prevents duplicate submissions while a request is pending", async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    const submit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<EndpointForm fields={[]} onSubmit={submit} />);
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByRole("button", { name: "Aguarde…" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Aguarde…" }));
    expect(submit).toHaveBeenCalledTimes(1);
    finish();
    expect(await screen.findByRole("button", { name: "Salvar" })).toBeEnabled();
  });
});
describe("PaginatedContent", () => {
  it("never offers a page outside the available range", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <PaginatedContent
        items={["one"]}
        meta={{ page: 1, limit: 1, total: 2, totalPages: 2 }}
        onPageChange={change}
        renderItem={(item) => <p key={item}>{item}</p>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Página anterior" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(change).toHaveBeenCalledWith(2);
  });
  it("handles an empty response without a page zero", () => {
    render(
      <PaginatedContent
        items={[]}
        meta={{ page: 1, limit: 10, total: 0, totalPages: 0 }}
        onPageChange={vi.fn()}
        renderItem={() => null}
      />,
    );
    expect(screen.getByText("Página 1 de 1 · 0 registros")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Próxima página" }),
    ).toBeDisabled();
  });
  it("shows request failures with a working retry control", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(
      <PaginatedContent
        items={[]}
        meta={{ page: 1, limit: 10, total: 0, totalPages: 0 }}
        onPageChange={vi.fn()}
        renderItem={() => null}
        error="Falha de rede"
        onRetry={retry}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Falha de rede");
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
describe("providers", () => {
  it("gates components using the session permission list", () => {
    render(
      <ContextProvider
        initialUser={{
          id: "user",
          email: "user@example.com",
          perfil: "aluno",
          permissoes: ["plantios:listar"],
        }}
      >
        <PermissionGate permission="plantios:listar">
          <p>Plantios</p>
        </PermissionGate>
        <PermissionGate
          permission="usuarios:criar"
          fallback={<p>Acesso restrito</p>}
        >
          <p>Criar usuário</p>
        </PermissionGate>
      </ContextProvider>,
    );
    expect(screen.getByText("Plantios")).toBeVisible();
    expect(screen.queryByText("Criar usuário")).not.toBeInTheDocument();
    expect(screen.getByText("Acesso restrito")).toBeVisible();
  });
  it("switches between dark, light and system themes", async () => {
    const user = userEvent.setup();
    render(
      <ContextProvider>
        <ThemeToggle />
      </ContextProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Tema escuro" }));
    expect(document.documentElement).toHaveClass("dark");
    await user.click(screen.getByRole("button", { name: "Tema claro" }));
    expect(document.documentElement).toHaveClass("light");
    await user.click(screen.getByRole("button", { name: "Tema do sistema" }));
    expect(localStorage.getItem("theme")).toBe("system");
  });
});
