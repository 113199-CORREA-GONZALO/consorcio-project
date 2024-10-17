export enum ArticleCategory {
    DURABLES = 'DURABLES',
    CONSUMABLES = 'CONSUMABLES',
    MATERIALS_CONSTRUCTION = 'MATERIALS_CONSTRUCTION',
    OTHERS = 'OTHERS'
  }

  export enum ArticleType {
    REGISTRABLE = 'REGISTRABLE',
    NON_REGISTRABLE = 'NON_REGISTRABLE'
  }

  export enum ArticleCondition {
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

  export interface Article {
    id?: number;
    identifier?: string; // Identificador único para ítems registrables
    name: string;
    description?: string; // Puede ser null
    location?: string; // Puede ser null
    type: ArticleType;
    status: ArticleCondition;
    category: ArticleCategory;
    measurement_unit: MeasurementUnit;
    article_status: Status; // Baja lógica
  }
