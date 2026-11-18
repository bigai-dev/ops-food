import { useMemo } from 'react'

// FoodOps chart palette. Hex values mirror the CSS theme tokens in src/index.css
// (SVG charts can't read CSS variables), so keep the two in step.
const LIGHT = {
  primary: '#B64E10', // terracotta, --color-primary
  surface: '#FEFDFB', // --color-card
  colors: ['#B64E10', '#389469', '#D29922', '#B65963', '#3D7B8E', '#7F8E4E'],
  good: '#179765',
  warn: '#DA950B',
  bad: '#D73431',
  tooltipBg: '#FFFFFF',
  text: '#1F1A16',
  muted: '#6F665D',
  grid: 'rgba(60, 40, 20, 0.1)',
  cursor: 'rgba(60, 40, 20, 0.05)',
}

const DARK = {
  primary: '#E99541', // amber, --color-primary in dark
  surface: '#231E1B', // --color-card in dark
  colors: ['#E99541', '#60BA8D', '#E7BF57', '#DF7E7F', '#71AFC3', '#A3B472'],
  good: '#4CBD88',
  warn: '#EDB345',
  bad: '#EF5F55',
  tooltipBg: '#2D2824', // --color-popover in dark
  text: '#EFEBE4',
  muted: '#AAA49B',
  grid: 'rgba(255, 245, 230, 0.08)',
  cursor: 'rgba(255, 245, 230, 0.05)',
}

export function useChartTheme(demo, isDark) {
  return useMemo(() => {
    const p = isDark ? DARK : LIGHT
    return {
      ...p,
      accent: p.colors[1],
      amber: p.colors[2],
      danger: p.bad,
      // Spread onto every <Tooltip>: readable label + values, soft hover band
      tooltip: {
        contentStyle: {
          background: p.tooltipBg,
          border: `1px solid ${p.grid}`,
          borderRadius: 10,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
          fontSize: 13,
        },
        labelStyle: { color: p.text, fontWeight: 600 },
        itemStyle: { color: p.text },
        cursor: { fill: p.cursor },
      },
    }
  }, [isDark])
}
