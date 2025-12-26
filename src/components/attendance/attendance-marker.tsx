import { useState } from 'react';
import { Button } from '../ui/button';
import { Popover } from '../ui/popover';
import { Textarea } from '../ui/textarea';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { AttendanceStatus } from '@/types/attendance';

interface AttendanceMarkerProps {
  studentName: string;
  currentStatus: AttendanceStatus;
  remarks?: string;
  onMark: (status: AttendanceStatus, remarks?: string) => void;
}

const statusConfig = {
  PRESENT: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/40',
    label: 'Present'
  },
  ABSENT: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/40',
    label: 'Absent'
  },
  LATE: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/40',
    label: 'Late'
  },
  EXCUSED: {
    icon: AlertCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    label: 'Excused'
  }
};

export function AttendanceMarker({
  studentName,
  currentStatus,
  remarks,
  onMark
}: AttendanceMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newRemarks, setNewRemarks] = useState(remarks || '');
  const StatusIcon = statusConfig[currentStatus].icon;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          className={`w-full justify-start space-x-2 ${statusConfig[currentStatus].bgColor}`}
        >
          <StatusIcon className={`w-5 h-5 ${statusConfig[currentStatus].color}`} />
          <span className="font-handwriting">{statusConfig[currentStatus].label}</span>
        </Button>
      </Popover.Trigger>

      <Popover.Content className="w-80">
        <div className="space-y-4">
          <h4 className="font-display text-lg text-primary-600">
            Mark Attendance for {studentName}
          </h4>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={status}
                  variant="outline"
                  className={`justify-start space-x-2 ${
                    currentStatus === status ? config.bgColor : ''
                  }`}
                  onClick={() => onMark(status as AttendanceStatus, newRemarks)}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="font-handwriting">{config.label}</span>
                </Button>
              );
            })}
          </div>

          <Textarea
            placeholder="Add remarks (optional)"
            value={newRemarks}
            onChange={(e) => setNewRemarks(e.target.value)}
            className="font-handwriting"
          />

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                onMark(currentStatus, newRemarks);
                setIsOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
} 