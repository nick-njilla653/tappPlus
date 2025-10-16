export interface User {
  id: string;
  email: string;
  role: string;
  timezone: string;
  organization?: Organization;
  doctor?: Doctor;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  speciality?: string;
  license?: string;
  isActive: boolean;
  user?: User;
}

export interface Person {
  id: string;
  fullName: string;
  birthdate?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  organizations?: PersonOrganization[];
  consultations?: Consultation[];
  interventions?: Intervention[];
}

export interface PersonOrganization {
  personId: string;
  orgId: string;
  startAt: string;
  endAt?: string;
  role?: string;
  isActive: boolean;
  person?: Person;
  org?: Organization;
}

export interface Consultation {
  id: string;
  personId: string;
  doctorId: string;
  dateTimeUtc: string;
  notes?: string;
  attachments?: string[];
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  person?: Person;
  doctor?: Doctor;
}

export interface Intervention {
  id: string;
  personId: string;
  doctorId: string;
  title: string;
  description?: string;
  scheduledAtUtc: string;
  priority: 'NORMAL' | 'URGENT' | 'LOW';
  status: 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
  location?: string;
  createdAt: string;
  updatedAt: string;
  person?: Person;
  doctor?: Doctor;
  reminders?: Reminder[];
  rules?: ReminderRule[];
}

export interface ReminderRule {
  id: string;
  interventionId: string;
  offsetMinutes: number;
  channel: 'EMAIL' | 'SMS' | 'PUSH';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  interventionId: string;
  plannedSendUtc: string;
  status: 'SCHEDULED' | 'SENT' | 'SKIPPED' | 'FAILED';
  lastError?: string;
  idempotencyKey: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  intervention?: Intervention;
  notificationLogs?: NotificationLog[];
}

export interface NotificationLog {
  id: string;
  reminderId?: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH';
  to: string;
  payload?: string;
  status: 'SENT' | 'FAILED' | 'DELIVERED' | 'READ';
  providerMsgId?: string;
  error?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
  role?: string;
  timezone?: string;
  organizationId?: string;
  speciality?: string;
  license?: string;
}

export interface CreateInterventionRequest {
  personId: string;
  doctorId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  priority?: 'NORMAL' | 'URGENT' | 'LOW';
  location?: string;
  rules?: {
    offsetMinutes: number;
    channel: 'EMAIL' | 'SMS' | 'PUSH';
    enabled?: boolean;
  }[];
}

export interface CreatePersonRequest {
  fullName: string;
  birthdate?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface CreateConsultationRequest {
  personId: string;
  doctorId: string;
  dateTime: string;
  notes?: string;
  attachments?: string[];
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface DashboardStats {
  totalInterventions: number;
  upcomingInterventions: number;
  urgentInterventions: number;
  completedInterventions: number;
  totalPatients: number;
  totalConsultations: number;
  reminderStats: {
    total: number;
    sent: number;
    failed: number;
    scheduled: number;
    skipped: number;
    successRate: string;
  };
}
