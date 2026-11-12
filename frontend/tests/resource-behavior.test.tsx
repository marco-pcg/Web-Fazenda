import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EndpointForm } from "@/components/resources/endpoint-form";
import { ResourceNavigation } from "@/components/resources/resource-navigation";
import { ResourceScreen as CultureScreen } from "@/features/culturas/components/resource-screen";
import { resource as culturas } from "@/features/culturas/definition";
import { resource as produtos } from "@/features/produtos/definition";
import { resource as talhoes } from "@/features/talhoes/definition";
import { resource as usuarios } from "@/features/usuarios/definition";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("resource behavior", () => {
  it("offers the backend's season choices as a multiselect on the culture creation page", () => {
    render(<CultureScreen endpointId="create" />);
    expect(screen.getByRole("listbox", { name: /Estações/ })).toBeRequired();
    expect(
      screen
        .getAllByRole("option")
        .map((option) => option.getAttribute("value")),
    ).toEqual(["primavera", "verao", "outono", "inverno"]);
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
    expect(
      culturas.endpoints
        .find((endpoint) => endpoint.method === "POST")
        ?.body.find((field) => field.name === "estacoes")?.kind,
    ).toBe("array");
  });
  it("does not allow reassignment of the farm when editing a plot", () => {
    const edit = talhoes.endpoints.find(
      (endpoint) => endpoint.method === "PATCH",
    )!;
    render(<EndpointForm fields={edit.body} />);
    expect(screen.queryByLabelText(/ID da fazenda/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Código")).not.toBeRequired();
  });
  it("omits immutable stock keys while preserving false when deactivating a product", async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    const edit = produtos.endpoints.find(
      (endpoint) => endpoint.method === "PATCH",
    )!;
    render(<EndpointForm fields={edit.body} onSubmit={save} />);
    expect(screen.queryByLabelText(/Chave do estoque/)).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Ativo"), "false");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(save).toHaveBeenCalledWith({ ativo: false });
  });
  it("opens the user email lookup through a safely encoded Next.js route", async () => {
    const user = userEvent.setup();
    render(<ResourceNavigation resource={usuarios} />);
    const endpoint = usuarios.endpoints.find(
      (item) => item.path === "/usuarios/email/:email",
    )!;
    const summary = screen.getByText(endpoint.title);
    await user.click(summary);
    const section = within(summary.closest("details")!);
    await user.type(section.getByLabelText(/E-mail/), "ana+turma@example.com");
    await user.click(section.getByRole("button", { name: "Abrir" }));
    expect(push).toHaveBeenCalledWith(
      "/usuarios/email/ana%2Bturma%40example.com",
    );
  });
});
