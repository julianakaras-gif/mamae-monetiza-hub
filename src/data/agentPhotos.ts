export const AGENT_PHOTOS: Record<string, string> = {
  clara: 'CLARA.png', aya: 'AYA.png', lucca: 'LUCCA.png', alice: 'ALICE.png',
  kaia: 'KAIA.png', talia: 'TALIA.png', lira: 'LIRA1.png', noa: 'NOA.png',
  eron: 'ERON.png', vera: 'VERA.png', cora: 'CORA.png', alma: 'ALMA.png',
  malu: 'MALU.png', kaena: 'KAENA.png', lumi: 'LUMI.png', luli: 'LULI.jpg',
  nara: 'NARA.png', petra: 'PETRA.png', alana: 'ALANA.png', nina: 'NINA.png',
  elisa: 'ELISA.png', luna: 'LUNA.png', maia: 'MAIA.png', liora: 'LIORA.png',
  serena: 'SERENA.png',
};

export function getAgentPhotoUrl(agentId: string): string | null {
  const file = AGENT_PHOTOS[agentId];
  if (!file) return null;
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/robos/${file}`;
}
