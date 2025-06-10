import axios from './axios'

export const getAllWritingPrompts = async () => {
    return axios.get('/api/writing/prompts')
}

export const getWritingPromptById = async (id) => {
    return axios.get(`/api/writing/prompts/${id}`)
}

export const createWritingPrompt = async (promptData) => {
    return axios.post('/api/writing/prompts', promptData)
}

export const updateWritingPrompt = async (id, promptData) => {
    return axios.put(`/api/writing/prompts/${id}`, promptData)
}

export const deleteWritingPrompt = async (id) => {
    return axios.delete(`/api/writing/prompts/${id}`)
}

export const submitWritingSubmission = async (submissionData) => {
    return axios.post('/api/writing/submissions', submissionData)
}

export const getWritingSubmissionById = async (id) => {
    return axios.get(`/api/writing/submissions/${id}`)
}

export const getUserWritingSubmissions = async () => {
    return axios.get('/api/writing/submissions')
}