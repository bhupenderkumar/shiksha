import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday } from 'date-fns';
import { Fee, FeeStatus } from '@/types/fee';
import { isAdminOrTeacher } from '@/services/profileService';
import { AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface FeeCardProps {
  fee: Fee;
  onDownloadReceipt: (fee: Fee) => void;
  onEdit: (fee: Fee) => void;
  onDelete?: (fee: Fee) => void;
}

// Helper function to get effective status (auto-detect OVERDUE)
const getEffectiveStatus = (fee: Fee): FeeStatus => {
  if (fee.status === FeeStatus.PAID) return FeeStatus.PAID;
  if (fee.status === FeeStatus.PARTIAL) return FeeStatus.PARTIAL;
  
  // Check if fee is overdue (past due date and not paid)
  const dueDate = new Date(fee.dueDate);
  if (isPast(dueDate) && !isToday(dueDate)) {
    return FeeStatus.OVERDUE;
  }
  
  return fee.status;
};

// Get status styling
const getStatusStyle = (status: FeeStatus): string => {
  switch (status) {
    case FeeStatus.PAID:
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    case FeeStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case FeeStatus.OVERDUE:
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case FeeStatus.PARTIAL:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300';
  }
};

// Get status icon
const StatusIcon: React.FC<{ status: FeeStatus }> = ({ status }) => {
  const iconClass = "w-3 h-3 mr-1";
  switch (status) {
    case FeeStatus.PAID:
      return <CheckCircle className={iconClass} />;
    case FeeStatus.PENDING:
      return <Clock className={iconClass} />;
    case FeeStatus.OVERDUE:
      return <AlertCircle className={iconClass} />;
    case FeeStatus.PARTIAL:
      return <AlertTriangle className={iconClass} />;
    default:
      return null;
  }
};

const FeeCard: React.FC<FeeCardProps> = ({ fee, onDownloadReceipt, onEdit, onDelete }) => {
  const effectiveStatus = getEffectiveStatus(fee);
  const isOverdue = effectiveStatus === FeeStatus.OVERDUE;
  
  return (
    <Card className={`p-4 ${isOverdue ? 'border-red-200 dark:border-red-900' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{fee.student?.name || 'Unknown Student'}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {fee.student?.class?.name} {fee.student?.class?.section}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {fee.feeType}
          </p>
        </div>
        <div className={`px-2 py-1 rounded text-sm flex items-center ${getStatusStyle(effectiveStatus)}`}>
          <StatusIcon status={effectiveStatus} />
          {effectiveStatus}
        </div>
      </div>
      
      <div className="mt-3">
        <p className="text-xl font-bold">₹{fee.amount.toLocaleString('en-IN')}</p>
        <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
          Due: {format(new Date(fee.dueDate), 'dd MMM yyyy')}
          {isOverdue && ' (Overdue)'}
        </p>
        {fee.paymentDate && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Paid: {format(new Date(fee.paymentDate), 'dd MMM yyyy')}
            {fee.paymentMethod && ` via ${fee.paymentMethod}`}
          </p>
        )}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {fee.status === FeeStatus.PAID && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadReceipt(fee)}
          >
            Download Receipt
          </Button>
        )}
        {isAdminOrTeacher() && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(fee)}
            >
              Edit
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => onDelete(fee)}
              >
                Delete
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default FeeCard;