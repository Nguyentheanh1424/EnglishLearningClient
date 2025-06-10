import axios from './axios';

// Lấy danh sách tất cả bài kiểm tra nghe
export const getAllListeningTests = async () => {
    return axios.get('/api/listening-tests');
};

// Lấy thông tin bài kiểm tra nghe theo ID
export const getListeningTestById = async (id) => {
    return axios.get(`/api/listening-tests/${id}`);
};

// Tạo mới bài kiểm tra nghe
export const createListeningTest = async (testData) => {
    return axios.post('/api/listening-tests', testData);
};

// Cập nhật bài kiểm tra nghe
export const updateListeningTest = async (id, testData) => {
    return axios.put(`/api/listening-tests/${id}`, testData);
};

// Xóa bài kiểm tra nghe
export const deleteListeningTest = async (id) => {
    return axios.delete(`/api/listening-tests/${id}`);
};

// === QUESTIONS MANAGEMENT ===
// Lấy tất cả câu hỏi của bài kiểm tra nghe
export const getListeningQuestionsByTestId = async (testId) => {
    return axios.get(`/api/listening-tests/${testId}/questions`);
};

// Tạo mới câu hỏi nghe
export const createListeningQuestion = async (testId, questionData) => {
    return axios.post(`/api/listening-tests/${testId}/questions`, questionData);
};

// Cập nhật câu hỏi nghe
export const updateListeningQuestion = async (testId, id, questionData) => {
    return axios.put(`/api/listening-tests/${testId}/questions/${id}`, questionData);
};

// Xóa câu hỏi nghe
export const deleteListeningQuestion = async (testId, id) => {
    return axios.delete(`/api/listening-tests/${testId}/questions/${id}`);
};

// === USER TEST ATTEMPTS ===
// Bắt đầu một lần thử bài kiểm tra
export const startTestAttempt = async (userId, testId) => {
    return axios.post('/api/user-test-attempts/start', { userId, testId });
};

// Gửi câu trả lời và hoàn thành bài kiểm tra
export const submitAndCompleteTestAttempt = async (attemptId, userAnswers) => {
    return axios.post(`/api/user-test-attempts/${attemptId}/submit-and-complete`, userAnswers);
};

// Lấy danh sách các lần thử của người dùng
export const getUserTestAttempts = async (userId, pageNumber = 1, pageSize = 10) => {
    return axios.get(`/api/user-test-attempts/user/${userId}`, {
        params: { pageNumber, pageSize }
    });
};

// Lấy thông tin lần thử theo ID (if needed for results page)
export const getTestAttemptById = async (id) => {
    return axios.get(`/api/user-test-attempts/${id}`);
};