import { useState } from 'react';
import { useAsync } from './use-async';
import { feeService } from '@/services/fee.service';
import type { Fee, CreateFeeData } from '@/types/fee';

export function useFees(studentId?: string) {
  const [fees, setFees] = useState<Fee[]>([]);

  const { loading, error, execute: fetchFees } = useAsync(
    async () => {
      const data = studentId 
        ? await feeService.getByStudent(studentId)
        : await feeService.getAll();
      setFees(data);
      return data;
    },
    { showErrorToast: true }
  );

  const { execute: createFee } = useAsync(
    async (data: CreateFeeData) => {
      const result = await feeService.create(data);
      await fetchFees();
      return result;
    },
    {
      showSuccessToast: true,
      showErrorToast: true
    }
  );

  const { execute: updateFeeStatus } = useAsync(
    async (id: string, status: FeeStatus, paymentDetails?: any) => {
      await feeService.updateStatus(id, status, paymentDetails);
      await fetchFees();
    },
    {
      showSuccessToast: true,
      showErrorToast: true
    }
  );

  const { execute: uploadAttachment } = useAsync(
    async (feeId: string, file: File) => {
      await feeService.uploadAttachment(feeId, file);
      await fetchFees();
    },
    {
      showSuccessToast: true,
      showErrorToast: true
    }
  );

  return {
    fees,
    loading,
    error,
    fetchFees,
    createFee,
    updateFeeStatus,
    uploadAttachment
  };
} 