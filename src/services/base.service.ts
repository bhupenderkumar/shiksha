import { supabase } from '@/lib/api-client';

export class BaseService {
  protected schema = 'school';
  protected table: string;

  constructor(table: string) {
    this.table = table;
  }

  protected get query() {
    return supabase.schema(this.schema).from(this.table);
  }

  protected handleError(error: any, message: string) {
    console.error(`${message}:`, error);
    throw error;
  }
} 