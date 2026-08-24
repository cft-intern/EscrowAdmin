import apiClient from '@/utils/api';
import { ApiResponse } from '@/types';

export interface AdminUser {
  id?: number | string;
  firstname: string;
  lastname: string;
  email: string;
  profileImage?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthenticatePayload {
  email: string;
  password: string;
}

export interface UpdateAdminProfilePayload {
  firstname?: string;
  lastname?: string;
  email?: string;
}

export interface UpdateProfileImagePayload {
  profileImage: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const adminService = {
  // POST /auth/login (Confirmed admin login endpoint)
  async authenticate(payload: AuthenticatePayload) {
    const response = await apiClient.post('/auth/login', {
      email: payload.email,
      password: payload.password,
    });
    return response.data;
  },

  // GET /admin
  async getProfile(): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.get('/admin');
    return response.data;
  },

  // PATCH /admin
  async updateProfile(payload: UpdateAdminProfilePayload): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.patch('/admin', payload);
    return response.data;
  },

  // POST /admin/profile-image
  async updateProfileImage(payload: UpdateProfileImagePayload): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.post('/admin/profile-image', payload);
    return response.data;
  },

  // POST /admin/change-password
  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/admin/change-password', payload);
    return response.data;
  },
};

export default adminService;
