import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => {
        if (token) {
          localStorage.setItem('accessToken', token)
        } else {
          localStorage.removeItem('accessToken')
        }
        set({ accessToken: token })
      },
      logout: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, accessToken: null })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
