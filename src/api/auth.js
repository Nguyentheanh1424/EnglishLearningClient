import axios from './axios'

export const login = async (username, password) => {
    return axios.post('/api/auth/login', {
        Username: username,
        Password: password
    })
}

export const register = async (username, email, password, fullName) => {
    return axios.post('/api/auth/register', {
        Username: username,
        Email: email,
        Password: password,
        FullName: fullName
    })
}

export const forgotPassword = async (email) => {
    return axios.post('/api/auth/forgot-password', {
        Email: email
    })
}

export const resetPassword = async (token, email, newPassword, confirmPassword) => {
    return axios.post('/api/auth/reset-password', {
        Token: token,
        Email: email,
        NewPassword: newPassword,
        ConfirmPassword: confirmPassword
    })
}