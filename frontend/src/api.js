import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Profile endpoints
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/profile/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createManualProfile = async (profile) => {
  const response = await api.post('/profile/manual', profile);
  return response.data;
};

export const getProfile = async (profileId) => {
  const response = await api.get(`/profile/${profileId}`);
  return response.data;
};

export const listProfiles = async () => {
  const response = await api.get('/profile/');
  return response.data;
};

// Interview endpoints
export const startSession = async (interviewType = 'mixed', language = 'en') => {
  const response = await api.post(`/interview/session/start?interview_type=${interviewType}&language=${language}`);
  return response.data;
};

export const endSession = async (sessionId) => {
  const response = await api.post(`/interview/session/${sessionId}/end`);
  return response.data;
};

export const getInterviewAssistance = async (request) => {
  const response = await api.post('/interview/assist', request);
  return response.data;
};

export const getCodingAssistance = async (request) => {
  const response = await api.post('/interview/coding-assist', request);
  return response.data;
};

export const getFeedback = async (request) => {
  const response = await api.post('/interview/feedback', request);
  return response.data;
};

export const translateText = async (text, targetLanguage) => {
  const response = await api.post(`/interview/translate?text=${encodeURIComponent(text)}&target_language=${targetLanguage}`);
  return response.data;
};

// Health check
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Live Interview endpoints
export const analyzeLiveTranscript = async (request) => {
  const response = await api.post('/live/analyze-transcript', request);
  return response.data;
};

export const getQuickAnswer = async (question, profile = null) => {
  const response = await api.post('/live/quick-answer', null, {
    params: { question },
    data: profile ? { profile } : undefined
  });
  return response.data;
};

export default api;

