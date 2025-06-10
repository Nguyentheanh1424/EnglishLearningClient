import axios from './axios'

export const getAllSpeakingTopics = async () => {
    return axios.get('/api/speaking/topics')
}

export const getSpeakingTopicById = async (id) => {
    return axios.get(`/api/speaking/topics/${id}`)
}

export const createSpeakingTopic = async (topicData) => {
    return axios.post('/api/speaking/topics', topicData)
}

export const updateSpeakingTopic = async (id, topicData) => {
    return axios.put(`/api/speaking/topics/${id}`, topicData)
}

export const deleteSpeakingTopic = async (id) => {
    return axios.delete(`/api/speaking/topics/${id}`)
}

export const submitSpeakingAttempt = async (formData) => {
    return axios.post('/api/speaking/attempts', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const getSpeakingAttemptById = async (id) => {
    return axios.get(`/api/speaking/attempts/${id}`)
}

export const getUserSpeakingAttempts = async () => {
    return axios.get('/api/speaking/attempts')
}