import { ServiceType } from "./enums/service-tpye.enum";
import { StatusType } from "./enums/status-type.enum";


// Definimos la interfaz Supplier para representar un proveedor en el sistema.
export interface Supplier {
  id: number; // Identificador único del proveedor.
  name: string; // Nombre del proveedor.
  serviceType: ServiceType; // Tipo de servicio que ofrece el proveedor.
  contact: string; // Información de contacto del proveedor.
  address: string; // Dirección del proveedor.
  details: string; // Detalles adicionales sobre el proveedor.
  state: StatusType; // Estado del proveedor (Activo o Inactivo).
}