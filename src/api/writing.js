import axios from './axios'

export const getAllWritingPrompts = async () => {
    return axios.get('/api/writing/prompts')
}

export const getWritingPromptById = async (id) => {
    return axios.get(`/api/writing/prompts/${id}`)
}

export const createWritingPrompt = async (token, promptData) => {
    return axios.post('/api/writing/prompts', promptData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const updateWritingPrompt = async (token, id, promptData) => {
    return axios.put(`/api/writing/prompts/${id}`, promptData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const deleteWritingPrompt = async (token, id) => {
    return axios.delete(`/api/writing/prompts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const submitWritingSubmission = async (token, submissionData) => {
    return axios.post('/api/writing/submissions', submissionData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getWritingSubmissionById = async (token, id) => {
    return axios.get(`/api/writing/submissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getUserWritingSubmissions = async (token) => {
    return axios.get('/api/writing/submissions', {
        headers: { Authorization: `Bearer ${token}` }
    })
}