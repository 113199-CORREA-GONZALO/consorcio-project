import { InventoryType } from './enums/inventory-type.enum';
import { StatusType } from './enums/status-type.enum';

export interface Inventory {
    id: number;
    item: string;
    type: InventoryType;
    stock: number;
    details: string;
    state: StatusType;
  }