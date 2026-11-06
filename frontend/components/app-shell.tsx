"use client";

import { useState } from "react";
import { ModuleCard, type FarmModule } from "./module-card";
import { EmptyState } from "./empty-state";

const modules: FarmModule[] = [
  {
    id: "cultivo",
    title: "Fazenda e cultivo",
    description: "Da preparação da terra à próxima colheita.",
    resources: ["Fazendas", "Talhões", "Culturas", "Plantios", "Colheitas"],
  },
  {
    id: "animais",
    title: "Animais e estações",
    description: "Cuide do rebanho e acompanhe os ciclos da natureza.",
    resources: [
      "Espécies",
      "Rebanhos",
      "Alimentações",
      "Produções",
      "Estações",
      "Temporadas",
      "Eventos climáticos",
    ],
  },
  {
    id: "mercado",
    title: "Mercado e cooperativa",
    description: "Conecte a produção às oportunidades do mercado.",
    resources: [
      "Produtos",
      "Estoque",
      "Cotações",
      "Ordens",
      "Transações",
      "Cooperativa",
    ],
  },
  {
    id: "academico",
    title: "Gestão acadêmica",
    description: "Organize as pessoas que fazem a fazenda acontecer.",
    resources: ["Turmas", "Usuários", "Perfis", "Permissões"],
  },
];

export function AppShell() {
  const [active, setActive] = useState("inicio");
  const [resource, setResource] = useState<string | null>(null);
  const selected = modules.find((module) => module.id === active);
  function navigate(id: string) {
    setActive(id);
    setResource(null);
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Web Fazenda, início">
          <span className="brand-mark">wf.</span>
          <span>
            web fazenda<small>APRENDER. CULTIVAR. CRESCER.</small>
          </span>
        </a>
        <p className="nav-label">ESPAÇO DE TRABALHO</p>
        <nav aria-label="Navegação principal">
          <button
            className={active === "inicio" ? "nav-item active" : "nav-item"}
            aria-current={active === "inicio" ? "page" : undefined}
            onClick={() => navigate("inicio")}
          >
            Visão geral
          </button>
          {modules.map((module, index) => (
            <button
              key={module.id}
              className={active === module.id ? "nav-item active" : "nav-item"}
              aria-current={active === module.id ? "page" : undefined}
              onClick={() => navigate(module.id)}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {module.title}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          Um espaço para aprender na prática.
          <p>Gestão acadêmica e agropecuária em um só lugar.</p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Seu espaço de cultivo /{" "}
            <strong>{selected?.title ?? "Visão geral"}</strong>
          </span>
          <span className="preview-badge">Versão inicial</span>
        </header>
        <main id="conteudo" tabIndex={-1}>
          <div className="page-heading">
            <p className="eyebrow">WEB FAZENDA · PAINEL DE GESTÃO</p>
            <h1>{selected?.title ?? "Boas ideias crescem aqui."}</h1>
            <p>
              {selected?.description ??
                "Planeje o cultivo, acompanhe a produção e aprenda a cada nova temporada."}
            </p>
          </div>
          {!selected ? (
            <>
              <section
                className="welcome-panel"
                aria-labelledby="welcome-title"
              >
                <div>
                  <span className="eyebrow">DA SALA DE AULA PARA O CAMPO</span>
                  <h2 id="welcome-title">
                    Sua próxima temporada
                    <br />
                    começa com um bom plano.
                  </h2>
                  <p>
                    Explore as ferramentas para cuidar de cada etapa da fazenda.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => navigate("cultivo")}
                  >
                    Explorar a fazenda ↗
                  </button>
                </div>
                <div className="field-art" aria-hidden="true">
                  <div className="sun" />
                  <div className="field one" />
                  <div className="field two" />
                  <div className="field three" />
                  <span>CULTIVANDO CONHECIMENTO</span>
                </div>
              </section>
              <section aria-labelledby="modules-title">
                <div className="section-heading">
                  <h2 id="modules-title">Tudo o que você precisa cultivar</h2>
                  <span>04 módulos</span>
                </div>
                <div className="module-grid">
                  {modules.map((module, index) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      index={index}
                      onSelect={navigate}
                    />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section
              className="resource-panel"
              aria-labelledby="resources-title"
            >
              <div className="section-heading">
                <h2 id="resources-title">Explore o módulo</h2>
                <button
                  className="text-button"
                  onClick={() => navigate("inicio")}
                >
                  Voltar à visão geral
                </button>
              </div>
              <div
                className="resource-tabs"
                role="group"
                aria-label="Recursos do módulo"
              >
                {selected.resources.map((item) => (
                  <button
                    key={item}
                    aria-pressed={resource === item}
                    onClick={() => setResource(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div aria-live="polite">
                <EmptyState
                  title={resource ?? "Escolha um recurso para começar"}
                  description={
                    resource
                      ? `A área de ${resource.toLocaleLowerCase("pt-BR")} está sendo preparada. Os registros serão exibidos aqui quando a integração estiver disponível.`
                      : "Selecione uma das áreas acima para conhecer o espaço de trabalho."
                  }
                />
              </div>
            </section>
          )}
          <footer className="page-footer">
            <span>Web Fazenda</span>
            <span>Cultivando conhecimento, juntos.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
