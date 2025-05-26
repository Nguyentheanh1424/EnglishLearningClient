import axios from './axios';

// Lấy danh sách tất cả bài kiểm tra
export const getAllMockTests = async () => {
    return axios.get('/api/mocktests');
};

// Lấy bài kiểm tra theo ID
export const getMockTestById = async (id) => {
    return axios.get(`/api/mocktests/${id}`);
};

// Tạo bài kiểm tra mới (Admin)
export const createMockTest = async (token, testData) => {
    return axios.post('/api/mocktests', testData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Cập nhật bài kiểm tra (Admin)
export const updateMockTest = async (token, id, testData) => {
    return axios.put(`/api/mocktests/${id}`, testData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Xóa bài kiểm tra (Admin)
export const deleteMockTest = async (token, id) => {
    return axios.delete(`/api/mocktests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Nộp bài kiểm tra
export const submitMockTest = async (token, id, answerData) => {
    return axios.post(`/api/mocktests/${id}/submit`, answerData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Lấy kết quả bài kiểm tra theo ID
export const getTestResultById = async (token, id) => {
    return axios.get(`/api/results/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Lấy lịch sử làm bài của người dùng
export const getUserTestHistory = async (token, userId) => {
    return axios.get('/api/results', {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId },
    });
};

// Lấy phân tích hiệu suất theo bài kiểm tra
export const getPerformanceAnalysis = async (token, mockTestId) => {
    return axios.get(`/api/performance-analyses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mockTestId },
    });
};