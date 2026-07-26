export function pluralize(count: number, singular: string, plural: string) {
  return count > 1 ? plural : singular
}

export function pluralCount(count: number, singular: string, plural: string) {
  return `${count} ${pluralize(count, singular, plural)}`
}
