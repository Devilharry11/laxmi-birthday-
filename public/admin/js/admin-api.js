// DOS LAXMI - Admin API Client

const AdminAPI = {
  getToken() {
    return localStorage.getItem('laxmi_admin_token') || '';
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('laxmi_admin_token', token);
    } else {
      localStorage.removeItem('laxmi_admin_token');
    }
  },

  async request(endpoint, options = {}) {
    const headers = options.headers || {};
    const token = this.getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    options.headers = headers;

    const response = await fetch(endpoint, options);

    // Auto logout on 401
    if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
      this.setToken(null);
      if (window.onAdminAuthFailed) {
        window.onAdminAuthFailed();
      }
      throw new Error('Session expired. Please log in again.');
    }

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json.error || `Request failed with status ${response.status}`);
    }

    return json;
  },

  // Auth
  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  },

  async getMe() {
    return await this.request('/api/auth/me');
  },

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    this.setToken(null);
  },

  async requestPasswordReset(email) {
    return await this.request('/api/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(token, newPassword) {
    return await this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  },

  async changePassword(currentPassword, newPassword) {
    return await this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // Content
  async getPublishedContent() {
    return await this.request('/api/content/published');
  },

  async getDraftContent() {
    return await this.request('/api/content/draft');
  },

  async saveDraftContent(content) {
    return await this.request('/api/content/draft', {
      method: 'PUT',
      body: JSON.stringify(content)
    });
  },

  async publishContent() {
    return await this.request('/api/content/publish', {
      method: 'POST'
    });
  },

  async discardDraft() {
    return await this.request('/api/content/discard', {
      method: 'POST'
    });
  },

  async getSummary() {
    return await this.request('/api/content/summary');
  },

  // Media
  async getMediaList(type) {
    const query = type ? `?type=${type}` : '';
    return await this.request(`/api/media${query}`);
  },

  async uploadFiles(formData, onProgress) {
    const token = this.getToken();
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/media/upload');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            onProgress(pct);
          }
        };
      }

      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(json);
          } else {
            reject(new Error(json.error || 'Upload failed'));
          }
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });
  },

  async updateMedia(id, updates) {
    return await this.request(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteMedia(id) {
    return await this.request(`/api/media/${id}`, {
      method: 'DELETE'
    });
  }
};

window.AdminAPI = AdminAPI;
