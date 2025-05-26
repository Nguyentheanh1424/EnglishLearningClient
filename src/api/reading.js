import axios from './axios'

export const getAllReadingPassages = async () => {
    return axios.get('/api/reading/passages')
}

export const getReadingPassageById = async (id) => {
    return axios.get(`/api/reading/passages/${id}`)
}

export const createReadingPassage = async (token, passageData) => {
    return axios.post('/api/reading/passages', passageData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const updateReadingPassage = async (token, id, passageData) => {
    return axios.put(`/api/reading/passages/${id}`, passageData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const deleteReadingPassage = async (token, id) => {
    return axios.delete(`/api/reading/passages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getUserReadingProgress = async (token) => {
    return axios.get('/api/reading/progress', {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getReadingProgressById = async (token, id) => {
    return axios.get(`/api/reading/progress/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const submitReadingAnswer = async (token, passageId, questionId, answerData) => {
    return axios.post(`/api/reading/progress/${passageId}/questions/${questionId}/submit`, answerData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getReadingQuestionById = async (id, mockTestId) => {
    return axios.get(`/api/reading/questions/${id}`, {
        params: { mockTestId }
    })
}

export const getReadingQuestionsByMockTestId = async (mockTestId) => {
    return axios.get('/api/reading/questions', {
        params: { mockTestId }
    })
}

export const createReadingQuestion = async (token, questionData) => {
    return axios.post('/api/reading/questions', questionData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const updateReadingQuestion = async (token, id, questionData) => {
    return axios.put(`/api/reading/questions/${id}`, questionData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const deleteReadingQuestion = async (token, id, mockTestId) => {
    return axios.delete(`/api/reading/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mockTestId }
    })
}

export const submitReadingQuestionAnswer = async (token, id, mockTestId, answerData) => {
    return axios.post(`/api/reading/questions/${id}/submit`, answerData, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mockTestId }
    })
}