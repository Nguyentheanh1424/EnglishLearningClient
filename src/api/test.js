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
export const createMockTest = async (testData) => {
    return axios.post('/api/mocktests', testData);
};

// Cập nhật bài kiểm tra (Admin)
export const updateMockTest = async (id, testData) => {
    return axios.put(`/api/mocktests/${id}`, testData);
};

// Xóa bài kiểm tra (Admin)
export const deleteMockTest = async (id) => {
    return axios.delete(`/api/mocktests/${id}`);
};

// Nộp bài kiểm tra
export const submitMockTest = async (id, answerData) => {
    return axios.post(`/api/mocktests/${id}/submit`, answerData);
};

// Lấy kết quả bài kiểm tra theo ID
export const getTestResultById = async (id) => {
    return axios.get(`/api/results/${id}`);
};

// Lấy lịch sử làm bài của người dùng
export const getUserTestHistory = async () => {
    return axios.get('/api/results');
};