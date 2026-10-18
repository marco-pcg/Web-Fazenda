import { SaudeRebanho } from '../../common/enums/enums';

export interface Rebanho {
  id: string;
  fazenda_id: string;
  especie_id: string;
  quantidade: number;
  saude: SaudeRebanho;
  ultima_alimentacao_em: Date | null;
  created_at: Date;
}

export interface FiltrosRebanho {
  especie_id?: string;
  saude?: SaudeRebanho;
  fazenda_ids?: string[];
  search?: string;
}
