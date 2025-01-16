import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Fee, FeeStatus } from '@/types/fee';
import { isAdminOrTeacher } from '@/services/profileService';

interface FeeCardProps {
  fee: Fee;
  onDownloadReceipt: (fee: Fee) => void;
  onEdit: (fee: Fee) => void;
}

const FeeCard: React.FC<FeeCardProps> = ({ fee, onDownloadReceipt, onEdit }) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{fee.student?.name}</h3>
          <p className="text-sm text-gray-600">
            {fee.student?.class?.name} {fee.student?.class?.section}
          </p>
        </div>
        <div className={`px-2 py-1 rounded text-sm ${
          fee.status === FeeStatus.PAID ? 'bg-green-100 text-green-800' :
          fee.status === FeeStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {fee.status}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-lg font-semibold">₹{fee.amount}</p>
        <p className="text-sm text-gray-600">
          Due: {format(new Date(fee.dueDate), 'dd MMM yyyy')}
        </p>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">Due: {format(new Date(fee.dueDate), 'dd MMM yyyy')}</p>
        {fee.status === FeeStatus.PAID && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadReceipt(fee)}
          >
            Download Receipt
          </Button>
        )}
      </div>
      <div className="mt-2">
        {isAdminOrTeacher() && <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(fee)}
        >
          Edit
        </Button>}
      </div>
    </Card>
  );
};

export default FeeCard;