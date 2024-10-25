import { ServiceType } from "./enums/service-tpye.enum";
import { StatusType } from "./enums/status-type.enum";


// Definimos la interfaz Supplier para representar un proveedor en el sistema.
export interface Supplier {
  id?: number;             // Identificador único del proveedor (opcional para creación)
  name: string;            // Nombre del proveedor
  cuil: string;            // CUIL del proveedor
  service: string;         // Servicio que ofrece el proveedor
  addressId: number;       // Relación con el ID de la dirección
  details?: string;        // Detalles adicionales sobre el proveedor (opcional)
  enabled: boolean;        // Si está activo o no
}

export interface Address {
  id: number;
  street_address: string;
  number: number;
  floor: number;
  apartment: string;
  city: string;
  province: string;        // Por ejemplo, "BUENOS_AIRES"
  country: string;         // Por ejemplo, "ARGENTINA"
  postal_code: number;
}