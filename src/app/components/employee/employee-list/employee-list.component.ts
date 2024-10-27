import { Component, EventEmitter, inject, ModelSignal, OnInit, Output } from '@angular/core';
import { DocumentType, Employee, EmployeeFilter, EmployeeType, StatusType } from '../../../models/employee.model';
import { EmployeesService } from '../../../services/employees.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

//exportar a pdf y excel
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import { EmployeeEditModalComponent } from "../employee-edit-modal/employee-edit-modal.component";
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, EmployeeEditModalComponent, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit{
  employeeList: Employee[] = [
    {
      id: 0,
      firstName: 'test',
      lastName: 'TEST',
      employeeType: EmployeeType.ADMIN,
      documentType: DocumentType.DNI,
      docNumber: '123456789',
      hiringDate: new Date().toISOString().split('T')[0],
      salary: 0,
      state: StatusType.ACTIVE,
    }
    
  ];
  //private modal: Modal | null = null;
  private fb = inject(FormBuilder);
  filterForm: FormGroup;

  currentPage: number = 1;
  totalPages: number = 0;
  itemsPerPage: number = 10;
  totalElements: number = 0;
  selectedStatus?: StatusType;
  statusTypes = Object.values(StatusType);
  employeeTypes = Object.values(EmployeeType);

  documentTypes = Object.values(DocumentType);
  private employeeService = inject(EmployeesService);
  private router = inject(Router);
  private mapperService = inject(MapperService);
  showModalFilters: boolean = false;


  constructor() {
    this.filterForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      employeeType: [''],
      docType: [''],
      docNumber: [''],
      hiringDate: [''],
      salary: [''],
      state: [''],
      enabled: [true]
    });
  }

  
  ngOnInit(): void {
    this.totalPages=1;
    this.loadEmployees();

    const modalElement = document.getElementById('filterModal');
    if (modalElement) {
      //this.modal = new Moda(modalElement);
    }

  }
  getEmployees() {
    this.employeeService.getEmployees().subscribe((employeeList) => {
      this.employeeList = employeeList;
    });
  }
  
  /*goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      // Actualizar lista de empleados
    }
  }
  
  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      // Actualizar lista de empleados
    }
  }*/

  editEmployee(employee: Employee): void {
    this.router.navigate(['employees/form', employee.id]);
  }

  @Output() showEditModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  showEditForm: boolean = false;
  editEmployee2(employee: Employee) {
    this.employeeService.setSelectedEmployee(employee);
    this.showEditForm = true;
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

  onModalClose() {
    this.showEditForm = false;
    this.getEmployees();
  }


  loadEmployees() {
    this.employeeService
      .getEmployeesPageable(this.currentPage - 1, this.itemsPerPage, this.selectedStatus)
      .subscribe({
        next: (response) => {
          response = this.mapperService.toCamelCase(response);
          this.employeeList = this.mapperService.toCamelCase(response.content);
          console.log(response)
          this.totalPages = this.mapperService.toCamelCase(response.totalPages);
          this.totalElements = this.mapperService.toCamelCase(response.totalElements);
        },
        error: (error) => {
          console.error('Error loading employees:', error);
        }
      });
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadEmployees();
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadEmployees();
    }
  }

  onItemsPerPageChange() {
    this.currentPage = 1; // Reset to first page when changing items per page
    this.loadEmployees();
  }

  filterByStatus(status?: StatusType) {
    this.selectedStatus = status;
    this.currentPage = 1; // Reset to first page when filtering
    this.loadEmployees();
  }

  openModalFilters(){
    this.showModalFilters = !this.showModalFilters; 
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300), // Esperar 300ms después del último cambio
      distinctUntilChanged() // Solo emitir si el valor ha cambiado
    ).subscribe(() => {
      this.applyFilter();
    });
  }
  applyFilter(): void {
    const filter: EmployeeFilter = Object.entries(this.filterForm.value).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        (acc as any)[key] = value;
      }
      return acc;
    }, {} as EmployeeFilter);

    this.employeeService.searchEmployees(filter).subscribe(
      (employees) => {
        this.employeeList = employees;
        // Cerrar el modal después de aplicar los filtros

      },
      (error) => {
        console.error('Error al filtrar empleados:', error);
        Swal.fire('Error', 'Error al filtrar empleados', 'error');
      }
    );
  }
/*
  applyFilter(): void {
    // Crear objeto de filtro solo con los campos que tienen valor
    const filter: EmployeeFilter = Object.entries(this.filterForm.value).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        (acc as any)[key] = value;
      }
      return acc;
    }, {} as EmployeeFilter);

    // Llamar al servicio con los filtros
    this.employeeService.searchEmployees(filter).subscribe(
      (employees) => {
        this.employeeList = employees;
      },
      (error) => {
        console.error('Error al filtrar empleados:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    );
  }*/
}
