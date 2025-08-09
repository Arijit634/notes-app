import { API_ENDPOINTS } from '../constants/api';
import { apiService } from './api';

/**
 * Notes Service
 * Handles all notes-related API calls
 */
export const notesService = {
  /**
   * Get all notes with pagination and filters
   */
  async getAllNotes(params = {}) {
    const response = await apiService.get(API_ENDPOINTS.NOTES.BASE, { params });
    return response.data;
  },

  /**
   * Get a specific note by ID
   */
  async getNoteById(id) {
    const response = await apiService.get(API_ENDPOINTS.NOTES.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Create a new note
   */
  async createNote(noteData) {
    const response = await apiService.post(API_ENDPOINTS.NOTES.BASE, noteData);
    return response.data;
  },

  /**
   * Update an existing note
   */
  async updateNote(id, noteData) {
    const response = await apiService.put(API_ENDPOINTS.NOTES.GET_BY_ID(id), noteData);
    return response.data;
  },

  /**
   * Delete a note
   */
  async deleteNote(id) {
    const response = await apiService.delete(API_ENDPOINTS.NOTES.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Search notes
   */
  async searchNotes(searchTerm, params = {}) {
    const response = await apiService.get(API_ENDPOINTS.NOTES.SEARCH, {
      params: {
        q: searchTerm,
        ...params
      }
    });
    return response.data;
  },

  /**
   * Bulk delete notes
   */
  async bulkDeleteNotes(noteIds) {
    const response = await apiService.delete(API_ENDPOINTS.NOTES.BULK_DELETE, {
      data: { noteIds }
    });
    return response.data;
  },

  /**
   * Get notes by category
   */
  async getNotesByCategory(category, params = {}) {
    const response = await apiService.get(API_ENDPOINTS.NOTES.BASE, {
      params: {
        category,
        ...params
      }
    });
    return response.data;
  },

  /**
   * Get shared notes
   */
  async getSharedNotes(params = {}) {
    const response = await apiService.get(API_ENDPOINTS.NOTES.BASE, {
      params: {
        shared: true,
        ...params
      }
    });
    return response.data;
  },

  /**
   * Share a note (toggle share status)
   */
  async shareNote(id) {
    const response = await apiService.post(`${API_ENDPOINTS.NOTES.GET_BY_ID(id)}/share`);
    return response.data;
  },

  /**
   * Get note statistics
   */
  async getNoteStats() {
    const response = await apiService.get(`${API_ENDPOINTS.NOTES.BASE}/stats`);
    return response.data;
  },

  /**
   * Export notes
   */
  async exportNotes(format = 'json', noteIds = []) {
    const response = await apiService.post(`${API_ENDPOINTS.NOTES.BASE}/export`, {
      format,
      noteIds
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Import notes
   */
  async importNotes(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.post(`${API_ENDPOINTS.NOTES.BASE}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default notesService;
