export type FarmModule = {
  id: string;
  title: string;
  description: string;
  resources: string[];
};

export function ModuleCard({
  module,
  index,
  onSelect,
}: {
  module: FarmModule;
  index: number;
  onSelect: (id: string) => void;
}) {
  return (
    <button className="module-card" onClick={() => onSelect(module.id)}>
      <span className="module-number">0{index + 1}</span>
      <h3>{module.title}</h3>
      <p>{module.description}</p>
      <span className="card-link">
        Explorar módulo <span aria-hidden="true">↗</span>
      </span>
    </button>
  );
}
