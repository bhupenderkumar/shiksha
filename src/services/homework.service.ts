import { apiClient } from '@/lib/api-client';
import type { Homework, CreateHomeworkDto, UpdateHomeworkDto } from '@/types/homework';
import { supabase } from '@/lib/api-client';

class HomeworkService {
  private readonly baseUrl = '/api/homeworks';

  async getAll(): Promise<Homework[]> {
    const response = await apiClient.get(this.baseUrl);
    return response.data;
  }

  async getById(id: string): Promise<Homework> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: CreateHomeworkDto): Promise<Homework> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdateHomeworkDto): Promise<Homework> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const homeworkService = new HomeworkService();

export const fetchHomeworkDetails = async (id) => {
  const { data, error } = await supabase
    .from('homework')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};