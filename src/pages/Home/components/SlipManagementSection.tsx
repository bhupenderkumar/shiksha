import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useSlipManagement } from '@/hooks/useSlipManagement';

export function SlipManagementSection() {
  const [newField, setNewField] = useState('');
  const { fields, addField, removeField } = useSlipManagement();

  const handleAddField = () => {
    if (newField.trim()) {
      addField(newField.trim());
      setNewField('');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">Slip Management</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configure and manage slip templates with custom fields
        </p>
      </motion.div>

      <div className="grid gap-8">
        <div className="flex gap-4">
          <Input
            placeholder="Add new field"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
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
                    onClick={() => removeField(field.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}