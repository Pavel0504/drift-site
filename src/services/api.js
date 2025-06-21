const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
   
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
     
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
     
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // File upload with FormData
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Multiple file upload
  async uploadMultipleFiles(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Multiple file upload failed:', error);
      throw error;
    }
  }

  // Albums
  async getAlbums() {
    return this.request('/albums');
  }

  async getAlbum(id) {
    return this.request(`/albums/${id}`);
  }

  async createAlbum(albumData) {
    return this.request('/albums', {
      method: 'POST',
      body: JSON.stringify(albumData),
    });
  }

  async updateAlbum(id, albumData) {
    return this.request(`/albums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(albumData),
    });
  }

  async deleteAlbum(id) {
    return this.request(`/albums/${id}`, {
      method: 'DELETE',
    });
  }

  // Events
  async getEvents() {
    return this.request('/events');
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id, eventData) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Reviews
  async getReviews() {
    return this.request('/reviews');
  }

  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settingsData) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // Statistics
  async getStatistics() {
    return this.request('/statistics');
  }

  async updateStatistics(statisticsData) {
    return this.request('/statistics', {
      method: 'PUT',
      body: JSON.stringify(statisticsData),
    });
  }

  // Download functions
  async downloadImage(filename) {
    window.open(`${API_BASE_URL}/download/image/${filename}`, '_blank');
  }

  async downloadAlbum(albumId) {
    window.open(`${API_BASE_URL}/download/album/${albumId}`, '_blank');
  }

  // Delete file
  async deleteFile(filename) {
    return this.request(`/files/${filename}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();