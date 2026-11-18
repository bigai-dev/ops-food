import { useMemo } from 'react'

export function useChartTheme(demo, isDark) {
  return useMemo(() => {
    // Chart-specific colors that work in both modes
    return {
      primary: '#2563EB',
      accent: '#10B981',
      danger: '#F43F5E',
      amber: '#F59E0B',
      colors: isDark
        ? ['#60A5FA', '#34D399', '#FBBF24', '#818CF8', '#6EE7B7']
        : ['#2563EB', '#10B981', '#F59E0B', '#3B82F6', '#34D399'],
      // Tooltip: always use high-contrast explicit bg + text
      bg: isDark ? '#27272a' : '#ffffff',
      text: isDark ? '#ffffff' : '#000000',
      label: isDark ? '#ffffff' : '#000000',
      muted: isDark ? '#a1a1aa' : '#71717a',
      grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    }
  }, [isDark])
}
