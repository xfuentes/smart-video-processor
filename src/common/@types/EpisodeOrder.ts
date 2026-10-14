export type EpisodeOrder = 'default' | 'official' | 'dvd' | 'absolute' | 'alternate' | 'regional' | 'altdvd' | 'alttwo'

export const EPISODE_ORDERS: EpisodeOrder[] = [
  'default',
  'official',
  'dvd',
  'absolute',
  'alternate',
  'regional',
  'altdvd',
  'alttwo'
]

// Absolute is a special order that changes the numbering, so it is always selectable.
export type EpisodeOrderLabels = Partial<Record<EpisodeOrder, string>>

export function getSelectableEpisodeOrders(
  availableOrders: (EpisodeOrder[] | undefined)[],
  current?: EpisodeOrder
): EpisodeOrder[] {
  const known = availableOrders.map((orders) => orders ?? (['official'] as EpisodeOrder[]))
  return EPISODE_ORDERS.filter(
    (order) => order === 'absolute' || order === current || known.every((orders) => orders.includes(order))
  )
}

export const EPISODE_ORDER_LABELS: Record<EpisodeOrder, string> = {
  default: 'Default',
  official: 'Aired',
  dvd: 'DVD',
  absolute: 'Absolute',
  alternate: 'Alternate',
  regional: 'Regional',
  altdvd: 'Alternate DVD',
  alttwo: 'Alternate 2'
}
