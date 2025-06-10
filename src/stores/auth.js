import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => {
        let user = null
        let userId = null
        const storedUser = localStorage.getItem('user')
        if (storedUser && storedUser !== 'undefined') {
            try {
                user = JSON.parse(storedUser)
                userId = user?.id || localStorage.getItem('userId') || null
            } catch (e) {
                console.error('Failed to parse user from localStorage:', e)
                user = null
                userId = null
                localStorage.removeItem('user')
                localStorage.removeItem('userId')
            }
        }

        return {
            token: localStorage.getItem('token') || null,
            refreshToken: localStorage.getItem('refreshToken') || null,
            user,
            userId
        }
    },
    actions: {
        setAuth({ token, refreshToken, user }) {
            this.token = token
            this.refreshToken = refreshToken
            this.user = user
            this.userId = user?.id || null

            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)

            if (user) {
                localStorage.setItem('user', JSON.stringify(user))
                if (user.id) {
                    localStorage.setItem('userId', user.id)
                } else {
                    localStorage.removeItem('userId')
                }
            } else {
                localStorage.removeItem('user')
                localStorage.removeItem('userId')
            }
        },
        clearAuth() {
            this.token = null
            this.refreshToken = null
            this.user = null
            this.userId = null
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            localStorage.removeItem('userId')
        }
    }
})