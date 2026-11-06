import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppShell } from "../components/app-shell";

describe("App navigation", () => {
  it("opens cultivation from the overview call to action", async () => {
    const user = userEvent.setup();
    render(<AppShell />);
    await user.click(
      screen.getByRole("button", { name: /Explorar a fazenda/ }),
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Fazenda e cultivo" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Plantios" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it.each([
    ["Fazenda e cultivo", "Colheitas"],
    ["Animais e estações", "Rebanhos"],
    ["Mercado e cooperativa", "Estoque"],
    ["Gestão acadêmica", "Turmas"],
  ])("opens %s through its module card", async (title, resource) => {
    const user = userEvent.setup();
    render(<AppShell />);
    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`.*${title}.*Explorar módulo`),
      }),
    );
    await user.click(screen.getByRole("button", { name: resource }));
    expect(screen.getByRole("heading", { name: resource })).toBeVisible();
    expect(screen.getByRole("button", { name: resource })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByText(
        /Os registros serão exibidos aqui quando a integração estiver disponível/,
      ),
    ).toBeVisible();
  });

  it("clears the selected resource when leaving and returning to a module", async () => {
    const user = userEvent.setup();
    render(<AppShell />);
    const navigation = within(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    );
    await user.click(
      navigation.getByRole("button", { name: /Fazenda e cultivo/ }),
    );
    await user.click(screen.getByRole("button", { name: "Plantios" }));
    await user.click(
      navigation.getByRole("button", { name: /Gestão acadêmica/ }),
    );
    await user.click(
      navigation.getByRole("button", { name: /Fazenda e cultivo/ }),
    );
    expect(screen.getByRole("button", { name: "Plantios" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.getByRole("heading", { name: "Escolha um recurso para começar" }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Voltar à visão geral" }),
    );
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Boas ideias crescem aqui.",
      }),
    ).toBeVisible();
    expect(
      navigation.getByRole("button", { name: "Visão geral" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
