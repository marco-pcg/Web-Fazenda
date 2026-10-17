import { SaudeRebanho } from '../common/enums';

export interface Rebanho {
  id: string;
  fazenda_id: string;
  especie_id: string;
  quantidade: number;
  saude: SaudeRebanho;
  ultima_alimentacao_em: Date | null;
  created_at: Date;
}
