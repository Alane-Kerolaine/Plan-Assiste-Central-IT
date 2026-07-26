export const transparencyKpis = [
  { label: 'Beneficiários ativos', value: 42850, format: 'number' as const },
  { label: 'Investimento assistencial anual', value: 186.4, format: 'millionsBRL' as const },
  { label: 'Credenciados credenciados', value: 3120, format: 'number' as const },
  { label: 'Municípios com cobertura', value: 412, format: 'number' as const },
]

export const expensesByCategory = [
  { category: 'Reembolsos de procedimentos', value: 68.4 },
  { category: 'Auxílio-medicamentos', value: 41.2 },
  { category: 'Autorização de procedimentos', value: 35.7 },
  { category: 'Rede credenciada direta', value: 28.9 },
  { category: 'Odontológico', value: 11.8 },
]

export const monthlyExpenses = [
  { month: 'Jan', value: 13.8 },
  { month: 'Fev', value: 14.1 },
  { month: 'Mar', value: 14.6 },
  { month: 'Abr', value: 15.0 },
  { month: 'Mai', value: 14.8 },
  { month: 'Jun', value: 15.4 },
  { month: 'Jul', value: 15.9 },
  { month: 'Ago', value: 16.2 },
  { month: 'Set', value: 15.7 },
  { month: 'Out', value: 16.8 },
  { month: 'Nov', value: 17.1 },
  { month: 'Dez', value: 17.8 },
]

export const beneficiariesByProfile = [
  { profile: 'Titulares', value: 18500, color: 'var(--brand-accent)' },
  { profile: 'Dependentes', value: 19200, color: 'var(--blue)' },
  { profile: 'Beneficiários especiais', value: 3150, color: 'var(--warning)' },
  { profile: 'Pensionistas', value: 2000, color: 'var(--danger)' },
]

export const networkByRegion = [
  { region: 'Sudeste', value: 1380 },
  { region: 'Nordeste', value: 620 },
  { region: 'Centro-Oeste', value: 540 },
  { region: 'Sul', value: 410 },
  { region: 'Norte', value: 170 },
]
