import { ServiceType } from "./enums/service-tpye.enum";
import { StatusType } from "./enums/status-type.enum";



export interface Supplier {
    id: number;
    name: string;
    serviceType: ServiceType;
    contact: string;
    address: string;
    details: string;
    state: StatusType;
  }
  