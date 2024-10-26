import { TemplateRef } from "@angular/core";

export class TableColumn {
    headerName : string = '';
    accessorKey : string = '';
    cellRenderer?: TemplateRef<any>;
}
