import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/api-client';
import { Schema, Database } from '../database.types';

interface ServiceError extends Error {
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
}

type QueryResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

export class BaseService {
  private readonly validIdentifierRegex = /^[a-zA-Z0-9_]+$/;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(
    protected readonly table: string,
    protected readonly schema: Schema = 'school',
    protected readonly client: SupabaseClient<Database> = supabase
  ) {
    this.validateIdentifier(table);
    this.validateIdentifier(schema);
  }

  private validateIdentifier(value: string): void {
    if (!value || !this.validIdentifierRegex.test(value)) {
      throw new Error(`Invalid identifier provided: ${value}`);
    }
  }

  protected sanitizeInput<T extends { [key: string]: any }>(input: T): T {
    if (!input || typeof input !== 'object') {
      return input;
    }

    const sanitized = {} as T;
    for (const [key, value] of Object.entries(input)) {
      this.validateIdentifier(key);
      
      if (typeof value === 'string') {
        sanitized[key as keyof T] = value.replace(/[;'"\\]/g, '') as T[keyof T];
      } else if (Array.isArray(value)) {
        sanitized[key as keyof T] = value.map(item => 
          typeof item === 'object' ? this.sanitizeInput(item) : item
        ) as T[keyof T];
      } else if (value && typeof value === 'object') {
        sanitized[key as keyof T] = this.sanitizeInput(value) as T[keyof T];
      } else {
        sanitized[key as keyof T] = value;
      }
    }
    
    return sanitized;
  }

  private createServiceError(error: any): ServiceError {
    const serviceError: ServiceError = new Error(
      'An error occurred while processing your request'
    );

    // Log the full error for debugging but with sensitive info removed
    console.error('Database Error:', {
      code: error?.code,
      message: error?.message,
      table: this.table,
      schema: this.schema,
      timestamp: new Date().toISOString()
    });

    if (error?.code) {
      serviceError.code = error.code;
      
      // Map error codes to user-friendly messages
      switch (error.code) {
        case '23505':
          serviceError.message = 'A record with this identifier already exists';
          serviceError.status = 409;
          break;
        case '23503':
          serviceError.message = 'Referenced record does not exist';
          serviceError.status = 404;
          break;
        case '42P01':
          serviceError.message = 'Invalid table operation';
          serviceError.status = 400;
          break;
        case '42703':
          serviceError.message = 'Invalid column operation';
          serviceError.status = 400;
          break;
        default:
          serviceError.status = 500;
      }
    }

    return serviceError;
  }

  protected async executeQuery<T>(queryFn: () => Promise<QueryResult<T>>): Promise<T> {
    let retries = this.maxRetries;

    while (retries >= 0) {
      try {
        const { data, error } = await queryFn();
        
        if (error) {
          throw this.createServiceError(error);
        }
        
        if (!data) {
          throw new Error('No data returned from query');
        }
        
        return data;
      } catch (error) {
        if (retries > 0 && this.isRetryableError(error)) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          retries--;
          continue;
        }
        throw this.createServiceError(error);
      }
    }

    throw new Error('Max retries exceeded');
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      '40001', // serialization failure
      '40P01', // deadlock detected
      '57014', // statement timeout
      'socket', // network issues
      'TimeoutError'
    ];
    
    return Boolean(
      error?.code && retryableCodes.includes(error.code) ||
      error?.message?.toLowerCase().includes('timeout') ||
      error?.message?.toLowerCase().includes('network')
    );
  }

  protected get queryBuilder() {
    return this.client.schema(this.schema as any).from(this.table);
  }

  protected async findById<T extends { id: string | number }>(id: string | number): Promise<T> {
    const response = await this.queryBuilder
      .select()
      .eq('id', id)
      .single();
      
    return this.executeQuery<T>(() => Promise.resolve({
      data: response.data as T,
      error: response.error
    }));
  }

  protected async findMany<T>(criteria: Partial<T> = {}): Promise<T[]> {
    const sanitizedCriteria = this.sanitizeInput(criteria);
    const response = await this.queryBuilder
      .select()
      .match(sanitizedCriteria);
      
    return this.executeQuery<T[]>(() => Promise.resolve({
      data: response.data as T[],
      error: response.error
    }));
  }

  protected async create<T extends { [key: string]: any }>(data: T): Promise<T> {
    const sanitizedData = this.sanitizeInput(data);
    const response = await this.queryBuilder
      .insert(sanitizedData)
      .select()
      .single();
      
    return this.executeQuery<T>(() => Promise.resolve({
      data: response.data as T,
      error: response.error
    }));
  }

  protected async update<T extends { [key: string]: any }>(
    id: string | number, 
    data: Partial<T>
  ): Promise<T> {
    const sanitizedData = this.sanitizeInput(data);
    const response = await this.queryBuilder
      .update(sanitizedData)
      .eq('id', id)
      .select()
      .single();
      
    return this.executeQuery<T>(() => Promise.resolve({
      data: response.data as T,
      error: response.error
    }));
  }

  protected async delete<T extends { id: string | number }>(id: string | number): Promise<T> {
    const response = await this.queryBuilder
      .delete()
      .eq('id', id)
      .select()
      .single();
      
    return this.executeQuery<T>(() => Promise.resolve({
      data: response.data as T,
      error: response.error
    }));
  }
}