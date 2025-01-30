import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; // Update with your backend service URL

export const admissionService = {
  async getAdmissionProgress(id: string) {
    const response = await axios.get(`${API_BASE_URL}/admission/progress/${id}`);
    return response.data;
  },

  async uploadDocument(prospectiveStudentId: string, file: File, documentType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await axios.post(`${API_BASE_URL}/admission/upload/${prospectiveStudentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async getDocumentUrl(filePath: string) {
    const response = await axios.get(`${API_BASE_URL}/admission/document-url`, { params: { filePath } });
    return response.data;
  },

  async verifyDocument(prospectiveStudentId: string, documentType: string, status: string, remarks?: string) {
    const response = await axios.post(`${API_BASE_URL}/admission/verify/${prospectiveStudentId}`, {
      documentType,
      status,
      remarks
    });
    return response.data;
  },

  async getAllDocuments(prospectiveStudentId: string) {
    const response = await axios.get(`${API_BASE_URL}/admission/documents/${prospectiveStudentId}`);
    return response.data;
  },

  async updateEnquiryStatus(id: string, newStatus: string) {
    const response = await axios.post(`${API_BASE_URL}/admission/update-status/${id}`, { newStatus });
    return response.data;
  },

  async getEnquiryById(id: string) {
    const response = await axios.get(`${API_BASE_URL}/admission/enquiry/${id}`);
    return response.data;
  },

  async getAllEnquiries(params?: any) {
    const response = await axios.get(`${API_BASE_URL}/admission/enquiries`, { params });
    return response.data;
  },

  async createEnquiry(data: any) {
    const response = await axios.post(`${API_BASE_URL}/admission/enquiry`, data);
    return response.data;
  },

  async updateEnquiry(id: string, data: any) {
    const response = await axios.put(`${API_BASE_URL}/admission/enquiry/${id}`, data);
    return response.data;
  },

  async getEnquiryNotes(id: string) {
    const response = await axios.get(`${API_BASE_URL}/admission/notes/${id}`);
    return response.data;
  },

  async addEnquiryNote(prospectiveStudentId: string, content: string) {
    const response = await axios.post(`${API_BASE_URL}/admission/note/${prospectiveStudentId}`, { content });
    return response.data;
  },

  async initializeAdmissionProcess(prospectiveStudentId: string) {
    const response = await axios.post(`${API_BASE_URL}/admission/initialize/${prospectiveStudentId}`);
    return response.data;
  },

  async updateAdmissionProgress(id: string, data: any) {
    const response = await axios.post(`${API_BASE_URL}/admission/update-progress/${id}`, data);
    return response.data;
  },

  async getCommunicationHistory(id: string) {
    const response = await axios.get(`${API_BASE_URL}/admission/communication/${id}`);
    return response.data;
  },

  async addCommunication(prospectiveStudentId: string, data: any) {
    const response = await axios.post(`${API_BASE_URL}/admission/communication/${prospectiveStudentId}`, data);
    return response.data;
  }
};
