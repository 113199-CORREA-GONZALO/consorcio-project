export enum ItemCategory {
    DURABLES = 'DURABLES',
    CONSUMABLES = 'CONSUMABLES',
    MATERIALS_CONSTRUCTION = 'MATERIALS_CONSTRUCTION',
    OTHERS = 'OTHERS'
  }
  
  export enum ItemType {
    REGISTRABLE = 'REGISTRABLE',
    NON_REGISTRABLE = 'NON_REGISTRABLE'
  }
  
  export enum ItemStatus {
    FUNCTIONAL = 'FUNCTIONAL',
    DEFECTIVE = 'DEFECTIVE',
    UNDER_REPAIR = 'UNDER_REPAIR'
  }
  
  export enum MeasurementUnit {
    LITERS = 'LITERS',
    KILOS = 'KILOS',
    UNITS = 'UNITS'
  }
  
  export enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
  }
  
  export interface Item {
    id?: number;
    identifier?: string; // Identificador único para ítems registrables
    name: string;
    description?: string; // Puede ser null
    location?: string; // Puede ser null
    type: ItemType;
    status: ItemStatus;
    category: ItemCategory;
    measurement_unit: MeasurementUnit;
    item_status: Status; // Baja lógica
  }
  