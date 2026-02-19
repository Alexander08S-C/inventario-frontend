import useAuthStore from '../store/authStore'

export const useDarkMode = () => {
  const darkMode = useAuthStore((state) => state.darkMode)

  return {
    darkMode,
    card: darkMode ? 'bg-gray-800 text-white' : 'bg-white',
    cardBorder: darkMode ? 'border-gray-700' : 'border-gray-200',
    table: darkMode ? 'bg-gray-800' : 'bg-white',
    tableHead: darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600',
    tableRow: darkMode ? 'hover:bg-gray-700 divide-gray-700' : 'hover:bg-gray-50 divide-gray-100',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    input: darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300',
    label: darkMode ? 'text-gray-300' : 'text-gray-700',
  }
}