import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageAnimation } from '@/components/ui/page-animation';
import { useSlipManagement } from '@/hooks/useSlipManagement';
import { Field } from '@/types/slip-management';
import { useToast } from '@/components/ui/use-toast';

export default function SlipManagement() {
  const [newFieldName, setNewFieldName] = useState('');
  const { toast } = useToast();
  const {
    fields,
    loading,
    error,
    addField,
    removeField,
    updateField,
    refreshFields,
  } = useSlipManagement();

  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      toast({
        title: 'Error',
        description: 'Field name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addField(newFieldName.trim());
      setNewFieldName('');
      toast({
        title: 'Success',
        description: 'Field added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add field',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveField = async (id: string) => {
    try {
      await removeField(id);
      toast({
        title: 'Success',
        description: 'Field removed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove field',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateField = async (id: string, name: string) => {
    try {
      await updateField(id, name);
      toast({
        title: 'Success',
        description: 'Field updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update field',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600">{error}</p>
        <Button onClick={refreshFields} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <PageAnimation>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Slip Management</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create and manage slip templates and fields
          </p>
        </motion.div>

        <div className="grid gap-8">
          {/* Fields Management Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Fields</h2>
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Add new field"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
              />
              <Button onClick={handleAddField}>Add Field</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>{field.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveField(field.id)}
                        className="ml-2"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </div>
      </div>
    </PageAnimation>
  );
}