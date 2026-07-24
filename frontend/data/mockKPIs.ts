export interface KPI {
  label: string
  value: number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

export const mockKPIs: KPI[] = [
  {
    label: 'Contracts Imported',
    value: 24,
    subtitle: '+6 this week',
    trend: {
      value: 6,
      direction: 'up',
    },
  },
  {
    label: 'Pending Review',
    value: 5,
    subtitle: 'Requires your attention',
  },
  {
    label: 'High Risk',
    value: 3,
    subtitle: 'Needs review',
  },
  {
    label: 'Expiring Soon',
    value: 7,
    subtitle: 'Within 30 days',
  },
]
