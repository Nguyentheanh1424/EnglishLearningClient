import axios from './axios'

export const getAllReadingPassages = async () => {
    return axios.get('/api/reading/passages')
}

export const getReadingPassageById = async (id) => {
    return axios.get(`/api/reading/passages/${id}`)
}

export const createReadingPassage = async (passageData) => {
    return axios.post('/api/reading/passages', passageData)
}

export const updateReadingPassage = async (id, passageData) => {
    return axios.put(`/api/reading/passages/${id}`, passageData)
}

export const deleteReadingPassage = async (id) => {
    return axios.delete(`/api/reading/passages/${id}`)
}

export const getUserReadingProgress = async () => {
    return axios.get('/api/reading/progress')
}

export const getReadingProgressById = async (id) => {
    return axios.get(`/api/reading/progress/${id}`)
}

export const submitReadingAnswer = async (passageId, questionId, answerData) => {
    return axios.post(`/api/reading/progress/${passageId}/questions/${questionId}/submit`, answerData)
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

export const createReadingQuestion = async (questionData) => {
    return axios.post('/api/reading/questions', questionData)
}

export const updateReadingQuestion = async (id, questionData) => {
    return axios.put(`/api/reading/questions/${id}`, questionData)
}

export const deleteReadingQuestion = async (id, mockTestId) => {
    return axios.delete(`/api/reading/questions/${id}`, {
        params: { mockTestId }
    })
}

export const submitReadingQuestionAnswer = async (id, mockTestId, answerData) => {
    return axios.post(`/api/reading/questions/${id}/submit`, answerData, {
        params: { mockTestId }
    })
}