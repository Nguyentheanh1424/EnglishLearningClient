import axios from './axios'

export const getAllSpeakingTopics = async () => {
    return axios.get('/api/speaking/topics')
}

export const getSpeakingTopicById = async (id) => {
    return axios.get(`/api/speaking/topics/${id}`)
}

export const createSpeakingTopic = async (token, topicData) => {
    return axios.post('/api/speaking/topics', topicData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const updateSpeakingTopic = async (token, id, topicData) => {
    return axios.put(`/api/speaking/topics/${id}`, topicData, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const deleteSpeakingTopic = async (token, id) => {
    return axios.delete(`/api/speaking/topics/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const submitSpeakingAttempt = async (token, attemptData) => {
    const formData = new FormData()
    formData.append('TopicId', attemptData.topicId)
    if (attemptData.audioFile) {
        formData.append('AudioFile', attemptData.audioFile)
    }
    return axios.post('/api/speaking/attempts', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const getSpeakingAttemptById = async (token, id) => {
    return axios.get(`/api/speaking/attempts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getUserSpeakingAttempts = async (token) => {
    return axios.get('/api/speaking/attempts', {
        headers: { Authorization: `Bearer ${token}` }
    })
}