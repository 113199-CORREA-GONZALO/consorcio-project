import { Component, inject, OnInit } from '@angular/core';
import { Employee } from '../../../models/employee.model';
import { EmployeesService } from '../../../services/employees.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

//exportar a pdf y excel
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import { auto } from '@popperjs/core';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit{
  employeeList: Employee[] = [];

  private employeeService = inject(EmployeesService);
  private router = inject(Router);

  ngOnInit(): void {
      this.getEmployees();
  }
  getEmployees() {
    this.employeeService.getEmployees().subscribe((employeeList) => {
      this.employeeList = employeeList;
    });
  }

  editEmployee(id: number): void {
    this.router.navigate(['employees/form', id]);
  }

  deleteEmployee(id: number): void {
    Swal.fire({
      title: '¿Estas Seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.employeeService.deleteEmployee(id).subscribe(() => {
        this.getEmployees();
        Swal.fire(
          'Eliminado!',
          'El empleado ha sido eliminado.',
          'success'
        );
      });
    };
  });
}

exportToPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Configurar el título
  const title = 'Listado de Empleados';
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  const tableColumn = ['Nombre', 'Apellido', 'Tipo', 'Turnos', 'Estado'];
  const tableRows: any[][] = [];
  
  // Preparar los datos para la tabla
  this.employeeList.forEach(employee => {
    const employeeData = [
      employee.firstName,
      employee.lastName,
      employee.employeeType,
      employee.shifts.shiftType,
      employee.state
    ];
    tableRows.push(employeeData);
  });

  // Configurar y generar la tabla
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25
  });
  

  // Generar el PDF
  doc.save('lista-empleados.pdf');
}

exportToExcel() {
  // Preparar los datos para Excel
  const data = this.employeeList.map(employee => ({
    Nombre: employee.firstName,
    Apellido: employee.lastName,
    Tipo: employee.employeeType,
    Turnos: employee.shifts.shiftType,
    Estado: employee.state
  }));

  // Crear una hoja de trabajo
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  
  // Crear un libro de trabajo y agregar la hoja
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Empleados');

  // Ajustar el ancho de las columnas
  const columnsWidth = [
    { wch: 15 }, // Nombre
    { wch: 15 }, // Apellido
    { wch: 15 }, // Tipo
    { wch: 15 }, // Turnos
    { wch: 15 }  // Estado
  ];
  ws['!cols'] = columnsWidth;

  // Generar el archivo Excel
  XLSX.writeFile(wb, 'lista-empleados.xlsx');
}
}
