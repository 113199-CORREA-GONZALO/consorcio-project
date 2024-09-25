import { EmployeeType } from './enums/employee-type.enum';
import {  DocumentType } from './enums/document-type.enum';
import { StatusType } from './enums/status-type.enum';

// Definimos la interfaz Employee para representar un empleado en el sistema.
export interface Employee {
  id: number; // Identificador único del empleado.
  firstName: string; // Primer nombre del empleado.
  lastName: string; // Apellido del empleado.
  employeeType: EmployeeType; // Tipo de empleado (ej. Admin, Técnico, etc.).
  docType: DocumentType; // Tipo de documento (DNI, Pasaporte, etc.).
  docNumber: string; // Número del documento del empleado.
  hiringDate: Date; // Fecha de contratación del empleado.
  entryTime: string; // Hora de entrada del empleado.
  exitTime: string; // Hora de salida del empleado.
  salary: number; // Salario del empleado.
  state: StatusType; // Estado del empleado (Activo o Inactivo).
}