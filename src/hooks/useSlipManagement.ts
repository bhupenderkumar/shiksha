import { useState, useEffect } from 'react';
import { slipManagementService } from '@/services/slipManagementService';
import { Field } from '@/types/slip-management';

export function useSlipManagement() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      const fieldsData = await slipManagementService.getFields();
      setFields(fieldsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const addField = async (name: string) => {
    try {
      const newField = await slipManagementService.addField(name);
      setFields(prev => [...prev, newField]);
      setError(null);
      return newField;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add field');
      throw err;
    }
  };

  const removeField = async (id: string) => {
    try {
      await slipManagementService.removeField(id);
      setFields(prev => prev.filter(field => field.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove field');
      throw err;
    }
  };

  const updateField = async (id: string, name: string) => {
    try {
      const updatedField = await slipManagementService.updateField(id, name);
      setFields(prev => prev.map(field => field.id === id ? updatedField : field));
      setError(null);
      return updatedField;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update field');
      throw err;
    }
  };

  return {
    fields,
    loading,
    error,
    addField,
    removeField,
    updateField,
    refreshFields: loadFields,
  };
}