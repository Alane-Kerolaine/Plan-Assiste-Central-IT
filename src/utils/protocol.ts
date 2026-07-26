export function generateProtocolNumber(): string {
  const year = new Date().getFullYear()
  const sequence = Math.floor(1000 + Math.random() * 9000)
  return `${year}-${sequence}`
}
