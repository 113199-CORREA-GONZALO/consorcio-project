export enum StatusType {
  ACTIVE = 'Active', // Activo
  INACTIVE = 'Inactive' // Inactivo
}

export enum EmployeeType {
  ADMIN = 'Admin', // Administrador
  TECHNICIAN = 'Technician', // Técnico
  MANAGER = 'Manager' // Gerente
}

export enum DocumentType {
  DNI = 'DNI', // Documento Nacional de Identidad
  PASSPORT = 'Passport', // Pasaporte
  LICENSE = 'License' // Licencia de Conducir
}

export enum ShiftType {
  DAY = 'DAY', // Turno de día
  NIGHT = 'NIGHT' // Turno de noche
}

export interface ShiftSchedule {
  entryTime: string; // Hora de entrada
  exitTime: string;  // Hora de salida
}

export interface EmployeeShifts {
  shifts: string[]; // Turnos asignados al empleado
  shiftType: ShiftType; // Tipo de turno (día, noche)
}

export interface Employee {
  id: number; // ID del empleado
  firstName: string; // Nombre
  lastName: string; // Apellido
  employeeType: EmployeeType; // Tipo de empleado (ADMIN, etc.)
  docType: DocumentType; // Tipo de documento (DNI, Pasaporte, etc.)
  docNumber: string; // Número de documento
  hiringDate: string; // Fecha de contratación
  salary: number; // Salario
  state: StatusType; // Estado (Activo, Inactivo)
  shifts: EmployeeShifts; // Turnos y horarios asignados
}

export interface EmployeePayment {
  id: number;
  employeeId: number;
  paymentDate: string; // Fecha de pago
  paymentAmount: number; // Monto de pago
  paymentDetail: string; // Detalle del pago
}
