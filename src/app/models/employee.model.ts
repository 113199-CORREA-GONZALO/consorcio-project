import { EmployeeType } from './enums/employee-type.enum';
import {  DocumentType } from './enums/document-type.enum';
import { StatusType } from './enums/status-type.enum';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeType: EmployeeType;
  docType: DocumentType;
  docNumber: string;
  hiringDate: Date;
  entryTime: string;
  exitTime: string;
  salary: number;
  state: StatusType;
}
