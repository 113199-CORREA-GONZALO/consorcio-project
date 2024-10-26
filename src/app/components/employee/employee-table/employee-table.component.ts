import { Component, Input } from '@angular/core';
import { TableColumn } from '../../../models/table-column';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-employee-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-table.component.html',
  styleUrl: './employee-table.component.css'
})
export class EmployeeTableComponent {

  @Input() columns : TableColumn[] = [];
  @Input() items: any[] = [];
  @Input() isLoading : boolean = false;
  @Input() columnss : {key: string, label: string}[] = [];

  exportToPDF() {
    const doc = new jsPDF();
    const tableColumn = this.columnss.map(column => column.label);
    const tableRows = this.items.map(item => this.columnss.map(column => item[column.key]));

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows
    });
    doc.save('table.data.pdf');
  }

  exportToExcel() {
    const data  = this.items.map(item => {
      const row : any = {};
      this.columnss.forEach(column => {
        row[column.label] = item[column.key];
      });
      return row;
    });

    const ws : XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb : XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1'); 
    XLSX.writeFile(wb, 'table.data.xlsx');
  }
}