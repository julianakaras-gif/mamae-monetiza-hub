import ALANA from '@/assets/robos/ALANA.png';
import ALICE from '@/assets/robos/ALICE.png';
import ALMA from '@/assets/robos/ALMA.png';
import AYA from '@/assets/robos/AYA.png';
import CLARA from '@/assets/robos/CLARA.png';
import CORA from '@/assets/robos/CORA.png';
import ELISA from '@/assets/robos/ELISA.png';
import ERON from '@/assets/robos/ERON.png';
import KAENA from '@/assets/robos/KAENA.png';
import KAIA from '@/assets/robos/KAIA.png';
import LIORA from '@/assets/robos/LIORA.png';
import LIRA1 from '@/assets/robos/LIRA1.png';
import LUCCA from '@/assets/robos/LUCCA.png';
import LULI from '@/assets/robos/LULI.jpg';
import LUMI from '@/assets/robos/LUMI.png';
import LUNA from '@/assets/robos/LUNA.png';
import MAIA from '@/assets/robos/MAIA.png';
import MALU from '@/assets/robos/MALU.png';
import NARA from '@/assets/robos/NARA.png';
import NINA from '@/assets/robos/NINA.png';
import NOA from '@/assets/robos/NOA.png';
import PETRA from '@/assets/robos/PETRA.png';
import SERENA from '@/assets/robos/SERENA.png';
import TALIA from '@/assets/robos/TALIA.png';
import VERA from '@/assets/robos/VERA.png';

const AGENT_PHOTOS: Record<string, string> = {
  clara: CLARA, aya: AYA, lucca: LUCCA, alice: ALICE,
  kaia: KAIA, talia: TALIA, lira: LIRA1, noa: NOA,
  eron: ERON, vera: VERA, cora: CORA, alma: ALMA,
  malu: MALU, kaena: KAENA, lumi: LUMI, luli: LULI,
  nara: NARA, petra: PETRA, alana: ALANA, nina: NINA,
  elisa: ELISA, luna: LUNA, maia: MAIA, liora: LIORA,
  serena: SERENA,
};

export function getAgentPhotoUrl(agentId: string): string | null {
  return AGENT_PHOTOS[agentId] || null;
}
