export function isFeatureInstrucoesCondicionaisEnabled(): boolean {
  return import.meta.env.VITE_FEATURE_INSTRUCOES_CONDICIONAIS === 'true'
}
