import axios from './axios'

export const getAllListeningExercises = async () => {
    return axios.get('/api/listening/exercises')
}

export const getListeningExerciseById = async (id) => {
    return axios.get(`/api/listening/exercises/${id}`)
}

export const createListeningExercise = async (token, exerciseData) => {
    return axios.post('/api/listening/exercises', exerciseData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const updateListeningExercise = async (token, id, exerciseData) => {
    return axios.put(`/api/listening/exercises/${id}`, exerciseData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const deleteListeningExercise = async (token, id) => {
    return axios.delete(`/api/listening/exercises/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getUserListeningProgress = async (token) => {
    return axios.get('/api/listening/progress', {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getListeningProgressById = async (token, id) => {
    return axios.get(`/api/listening/progress/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const submitListeningAnswer = async (token, exerciseId, questionId, answerData) => {
    return axios.post(`/api/listening/progress/${exerciseId}/questions/${questionId}/submit`, answerData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getListeningQuestionById = async (id, mockTestId) => {
    return axios.get(`/api/listening/questions/${id}`, {
        params: { mockTestId }
    })
}

export const getListeningQuestionsByMockTestId = async (mockTestId) => {
    return axios.get('/api/listening/questions', {
        params: { mockTestId }
    })
}

export const createListeningQuestion = async (token, questionData) => {
    return axios.post('/api/listening/questions', questionData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const updateListeningQuestion = async (token, id, questionData) => {
    return axios.put(`/api/listening/questions/${id}`, questionData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const deleteListeningQuestion = async (token, id, mockTestId) => {
    return axios.delete(`/api/listening/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mockTestId }
    })
}

export const submitListeningQuestionAnswer = async (token, id, mockTestId, answerData) => {
    return axios.post(`/api/listening/questions/${id}/submit`, answerData, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mockTestId }
    })
}