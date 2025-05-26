import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => {
        let user = null
        const storedUser = localStorage.getItem('user')
        if (storedUser && storedUser !== 'undefined') { // Kiểm tra giá trị không phải "undefined"
            try {
                user = JSON.parse(storedUser)
            } catch (e) {
                console.error('Failed to parse user from localStorage:', e)
                user = null
                localStorage.removeItem('user') // Xóa giá trị không hợp lệ
            }
        }

        return {
            token: localStorage.getItem('token') || null,
            refreshToken: localStorage.getItem('refreshToken') || null,
            user
        }
    },
    actions: {
        setAuth({ token, refreshToken, user }) {
            this.token = token
            this.refreshToken = refreshToken
            this.user = user
            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)
            // Chỉ lưu user nếu user không phải undefined hoặc null
            if (user) {
                localStorage.setItem('user', JSON.stringify(user))
            } else {
                localStorage.removeItem('user')
            }
        },
        clearAuth() {
            this.token = null
            this.refreshToken = null
            this.user = null
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
        }
    }
})