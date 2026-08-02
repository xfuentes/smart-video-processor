export type EpisodeOrder =
  | 'default'
  | 'official'
  | 'dvd'
  | 'absolute'
  | 'alternate'
  | 'regional'
  | 'altdvd'
  | 'alttwo'

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

export const EPISODE_ORDER_LABELS: Record<EpisodeOrder, string> = {
  default: 'Default',
  official: 'Official',
  dvd: 'DVD',
  absolute: 'Absolute',
  alternate: 'Alternate',
  regional: 'Regional',
  altdvd: 'Alternate DVD',
  alttwo: 'Alternate 2'
}
