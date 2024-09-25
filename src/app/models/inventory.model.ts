import { InventoryType } from './enums/inventory-type.enum';
import { StatusType } from './enums/status-type.enum';

// Definimos la interfaz Inventory para representar un ítem de inventario en el sistema.
export interface Inventory {
  id: number; // Identificador único del ítem de inventario.
  item: string; // Nombre del ítem de inventario.
  type: InventoryType; // Tipo de inventario (Materia prima, Producto terminado, etc.).
  stock: number; // Cantidad en stock del ítem.
  details: string; // Detalles adicionales sobre el ítem de inventario.
  state: StatusType; // Estado del ítem de inventario (Activo o Inactivo).
}