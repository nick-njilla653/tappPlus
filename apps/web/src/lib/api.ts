import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5550';
    
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor pour ajouter le token d'authentification
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor pour gérer les erreurs
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/auth/login';
          toast.error('Session expirée. Veuillez vous reconnecter.');
        } else if (error.response?.status >= 500) {
          toast.error('Erreur serveur. Veuillez réessayer plus tard.');
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  public setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  // Méthodes d'authentification
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    const { access_token, refresh_token, user } = response.data;
    
    this.setToken(access_token);
    this.setRefreshToken(refresh_token);
    
    return { user, access_token, refresh_token };
  }

  async register(data: any) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/auth/refresh', {
      refresh_token: refreshToken,
    });

    const { access_token, user } = response.data;
    this.setToken(access_token);
    
    return { user, access_token };
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // Méthodes pour les interventions
  async getInterventions(params?: any) {
    const response = await this.client.get('/interventions', { params });
    return response.data;
  }

  async getUpcomingInterventions(days?: number) {
    const response = await this.client.get('/interventions/upcoming', {
      params: { days },
    });
    return response.data;
  }

  async createIntervention(data: any) {
    const response = await this.client.post('/interventions', data);
    return response.data;
  }

  async updateIntervention(id: string, data: any) {
    const response = await this.client.patch(`/interventions/${id}`, data);
    return response.data;
  }

  async deleteIntervention(id: string) {
    const response = await this.client.delete(`/interventions/${id}`);
    return response.data;
  }

  // Méthodes pour les personnes
  async getPeople(params?: any) {
    const response = await this.client.get('/people', { params });
    return response.data;
  }

  async getPerson(id: string) {
    const response = await this.client.get(`/people/${id}`);
    return response.data;
  }

  async createPerson(data: any) {
    const response = await this.client.post('/people', data);
    return response.data;
  }

  async updatePerson(id: string, data: any) {
    const response = await this.client.patch(`/people/${id}`, data);
    return response.data;
  }

  async deletePerson(id: string) {
    const response = await this.client.delete(`/people/${id}`);
    return response.data;
  }

  // Méthodes pour les consultations
  async getConsultations(params?: any) {
    const response = await this.client.get('/consultations', { params });
    return response.data;
  }

  async getPatientHistory(personId: string, doctorId?: string) {
    const response = await this.client.get(`/consultations/history/${personId}`, {
      params: { doctorId },
    });
    return response.data;
  }

  async createConsultation(data: any) {
    const response = await this.client.post('/consultations', data);
    return response.data;
  }

  async updateConsultation(id: string, data: any) {
    const response = await this.client.patch(`/consultations/${id}`, data);
    return response.data;
  }

  async deleteConsultation(id: string) {
    const response = await this.client.delete(`/consultations/${id}`);
    return response.data;
  }

  // Méthodes pour les rappels
  async getReminders(params?: any) {
    const response = await this.client.get('/reminders', { params });
    return response.data;
  }

  async getReminder(id: string) {
    const response = await this.client.get(`/reminders/${id}`);
    return response.data;
  }

  async createReminder(data: any) {
    const response = await this.client.post('/reminders', data);
    return response.data;
  }

  async updateReminder(id: string, data: any) {
    const response = await this.client.patch(`/reminders/${id}`, data);
    return response.data;
  }

  async deleteReminder(id: string) {
    const response = await this.client.delete(`/reminders/${id}`);
    return response.data;
  }

  async getReminderStats() {
    const response = await this.client.get('/reminders/stats');
    return response.data;
  }

  async retryReminder(id: string) {
    const response = await this.client.post(`/reminders/${id}/retry`);
    return response.data;
  }

  // Méthodes pour les organisations
  async getOrganizations() {
    const response = await this.client.get('/organizations');
    return response.data;
  }

  async getOrganization(id: string) {
    const response = await this.client.get(`/organizations/${id}`);
    return response.data;
  }

  async getOrganizationStats(id: string) {
    const response = await this.client.get(`/organizations/${id}/stats`);
    return response.data;
  }

  // Méthodes pour les notifications
  async getNotificationStats(interventionId?: string) {
    const response = await this.client.get('/notifications/stats', {
      params: { interventionId },
    });
    return response.data;
  }

  async testEmail(to: string) {
    const response = await this.client.post('/notifications/test/email', { to });
    return response.data;
  }

  async testSms(to: string) {
    const response = await this.client.post('/notifications/test/sms', { to });
    return response.data;
  }

  async testPush(token: string) {
    const response = await this.client.post('/notifications/test/push', { token });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
