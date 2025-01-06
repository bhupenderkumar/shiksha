export interface Attendance {
  id: string;
  studentId: string;
  date: Date;
  status: AttendanceStatus;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    class?: {
      id: string;
      name: string;
      section: string;
    };
  };
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export interface AttendanceRecord {
  date: Date;
  records: {
    [studentId: string]: {
      status: AttendanceStatus;
      remarks?: string;
    };
  };
} 