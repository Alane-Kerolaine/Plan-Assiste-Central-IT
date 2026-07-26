import { supportFaqs } from '../data/supportFaqs'

export type AssistantReply = {
  text: string
  cta?: { label: string; to: string }
}

const SUPPORT_CTA = { label: 'Ver Fale conosco', to: '/fale-conosco' }
const FAQ_CTA = { label: 'Ver todas as dúvidas frequentes', to: '/fale-conosco#duvidas-frequentes' }

const STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'em', 'no', 'na', 'nos', 'nas',
  'um', 'uma', 'uns', 'umas', 'para', 'por', 'com', 'sem', 'que', 'quem', 'qual', 'quais', 'como',
  'quando', 'onde', 'se', 'meu', 'minha', 'meus', 'minhas', 'seu', 'sua', 'seus', 'suas', 'eu',
  'voce', 'vc', 'ele', 'ela', 'me', 'mim', 'tem', 'ter', 'tenho', 'sobre', 'ao', 'aos', 'à', 'às',
  'é', 'sao', 'foi', 'ser', 'esta', 'esse', 'essa', 'isso', 'isto', 'gostaria', 'poderia', 'pode',
  'favor', 'por favor', 'ola', 'oi',
])

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function tokenize(text: string) {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token))
}

function scoreFaq(queryTokens: string[], faq: (typeof supportFaqs)[number]) {
  const questionTokens = new Set(tokenize(faq.question))
  const categoryTokens = new Set(tokenize(faq.category))
  const answerTokens = new Set(tokenize(faq.answer))

  let score = 0
  let matchedQuestionTokens = 0
  for (const token of queryTokens) {
    if (questionTokens.has(token)) {
      score += 4
      matchedQuestionTokens += 1
    } else if (categoryTokens.has(token)) {
      score += 2
    } else if (answerTokens.has(token)) {
      score += 1
    }
  }

  // Reward FAQs whose question is mostly covered by the query, so a tight
  // match (few extra words in the question) outranks a longer question that
  // only partially overlaps.
  if (matchedQuestionTokens > 0) {
    score += 5 * (matchedQuestionTokens / questionTokens.size)
  }

  return score
}

function findBestFaq(message: string) {
  const queryTokens = tokenize(message)
  if (queryTokens.length === 0) return null

  let best: (typeof supportFaqs)[number] | null = null
  let bestScore = 0
  for (const faq of supportFaqs) {
    const score = scoreFaq(queryTokens, faq)
    if (score > bestScore) {
      bestScore = score
      best = faq
    }
  }

  return bestScore >= 3 ? best : null
}

const GREETING_PATTERN = /^\s*(oi+|ol[aá]|e a[ií]|eae|bom dia|boa tarde|boa noite|hey|hello)\b/
const THANKS_PATTERN = /\b(obrigad|valeu|vlw|agradec)/
const HUMAN_PATTERN = /\b(atendente|humano|pessoa real|falar com algu[eé]m|reclama|ouvidoria|denunci|manifestac)/

export function getAssistantReply(message: string): AssistantReply {
  const normalized = normalize(message.trim())

  if (!normalized) {
    return { text: 'Pode digitar sua dúvida sobre o Plan-Assiste? Estou aqui para ajudar.' }
  }

  if (THANKS_PATTERN.test(normalized)) {
    return { text: 'Por nada! Se surgir outra dúvida sobre o Plan-Assiste, é só perguntar.' }
  }

  if (HUMAN_PATTERN.test(normalized)) {
    return {
      text: 'Para falar com um atendente humano, use a Central de Atendimento 24h (0800 591 2455) ou os canais de Fale conosco.',
      cta: SUPPORT_CTA,
    }
  }

  if (GREETING_PATTERN.test(normalized) && normalized.length < 24) {
    return {
      text: 'Olá! Posso ajudar com dúvidas sobre cadastro, financeiro, cobertura, autorização de procedimentos e rede credenciada. O que você gostaria de saber?',
    }
  }

  const faq = findBestFaq(message)
  if (faq) {
    return { text: faq.answer, cta: FAQ_CTA }
  }

  return {
    text: 'Não encontrei uma resposta exata para isso na base de dúvidas do Plan-Assiste. Tente reformular a pergunta ou fale com a Central de Atendimento 24h (0800 591 2455) pelo Fale conosco.',
    cta: SUPPORT_CTA,
  }
}
