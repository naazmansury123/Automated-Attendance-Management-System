
export enum AttendanceStatus {
  ON_TIME = 'On Time',
  LATE = 'Late',
  LEAVE = 'Leave'
}

export interface Employee {
  id: string;
  name: string;
  password: string;
  department: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  signInTime: string;
  signOutTime?: string;
  date: string;
  status: AttendanceStatus;
}

export type ViewType = 'EMPLOYEE' | 'MANAGER';
