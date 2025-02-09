import { supabase } from '@/lib/supabase';
import {
  Field,
  SlipTemplate,
  SlipData,
  CreateFieldRequest,
  UpdateFieldRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  CreateSlipDataRequest,
  UpdateSlipDataRequest,
} from '@/types/slip-management';

class SlipManagementService {
  // Field operations
  async getFields(): Promise<Field[]> {
    const { data, error } = await supabase
      .from('slip_fields')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async addField(name: string): Promise<Field> {
    const { data, error } = await supabase
      .from('slip_fields')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateField(id: string, name: string): Promise<Field> {
    const { data, error } = await supabase
      .from('slip_fields')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async removeField(id: string): Promise<void> {
    const { error } = await supabase
      .from('slip_fields')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // Template operations
  async getTemplates(): Promise<SlipTemplate[]> {
    const { data, error } = await supabase
      .from('slip_templates')
      .select(`
        *,
        fields:slip_template_fields(
          field:slip_fields(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map((template) => ({
      ...template,
      fields: template.fields.map((f: any) => f.field),
    }));
  }

  async createTemplate(request: CreateTemplateRequest): Promise<SlipTemplate> {
    const { data: template, error: templateError } = await supabase
      .from('slip_templates')
      .insert([{ name: request.name }])
      .select()
      .single();

    if (templateError) throw new Error(templateError.message);

    const fieldMappings = request.fieldIds.map((fieldId) => ({
      template_id: template.id,
      field_id: fieldId,
    }));

    const { error: mappingError } = await supabase
      .from('slip_template_fields')
      .insert(fieldMappings);

    if (mappingError) throw new Error(mappingError.message);

    return {
      ...template,
      fields: [],  // Fields will be populated when fetching
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    };
  }

  async updateTemplate(id: string, request: UpdateTemplateRequest): Promise<SlipTemplate> {
    if (request.name) {
      const { error: nameError } = await supabase
        .from('slip_templates')
        .update({ name: request.name })
        .eq('id', id);

      if (nameError) throw new Error(nameError.message);
    }

    if (request.fieldIds) {
      // Remove existing mappings
      const { error: deleteError } = await supabase
        .from('slip_template_fields')
        .delete()
        .eq('template_id', id);

      if (deleteError) throw new Error(deleteError.message);

      // Add new mappings
      const fieldMappings = request.fieldIds.map((fieldId) => ({
        template_id: id,
        field_id: fieldId,
      }));

      const { error: insertError } = await supabase
        .from('slip_template_fields')
        .insert(fieldMappings);

      if (insertError) throw new Error(insertError.message);
    }

    const { data, error } = await supabase
      .from('slip_templates')
      .select(`
        *,
        fields:slip_template_fields(
          field:slip_fields(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    return {
      ...data,
      fields: data.fields.map((f: any) => f.field),
    };
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('slip_templates')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // Slip data operations
  async getSlipData(templateId?: string): Promise<SlipData[]> {
    let query = supabase
      .from('slip_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async createSlipData(request: CreateSlipDataRequest): Promise<SlipData> {
    const { data, error } = await supabase
      .from('slip_data')
      .insert([{
        template_id: request.templateId,
        values: request.values,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateSlipData(id: string, request: UpdateSlipDataRequest): Promise<SlipData> {
    const { data, error } = await supabase
      .from('slip_data')
      .update({ values: request.values })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteSlipData(id: string): Promise<void> {
    const { error } = await supabase
      .from('slip_data')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}

export const slipManagementService = new SlipManagementService();