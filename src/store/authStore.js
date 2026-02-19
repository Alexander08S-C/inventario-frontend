import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      roles: [],
      permissions: [],
      darkMode: false,

      setAuth: (data) => set({
        user: data.user,
        token: data.token,
        roles: data.roles,
        permissions: data.permissions,
      }),

      logout: () => set({
        user: null,
        token: null,
        roles: [],
        permissions: [],
      }),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      hasPermission: (permission) => {
        const state = useAuthStore.getState()
        return state.permissions.includes(permission)
      },

      hasRole: (role) => {
        const state = useAuthStore.getState()
        return state.roles.includes(role)
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore