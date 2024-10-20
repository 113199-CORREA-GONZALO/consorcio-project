import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceType } from '../../../models/enums/service-tpye.enum';
import { StatusType } from '../../../models/inventory.model';
import { ProvidersService } from '../../../services/providers.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Supplier } from '../../../models/supplier.model';

@Component({
  selector: 'app-provider-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './provider-form.component.html',
  styleUrl: './provider-form.component.css'
})
export class ProviderFormComponent implements OnInit{
  providerForm: FormGroup;
  serviceTypes = Object.values(ServiceType);
  statusTypes = Object.values(StatusType);
  isEditMode = false;
  currentProviderId: number | null = null;

  private providerService = inject(ProvidersService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    this.providerForm = this.fb.group({
      name: ['', Validators.required],
      serviceType: ['', Validators.required],
      contact: ['', Validators.required],
      address: ['', Validators.required],
      details: ['', Validators.required],
      state: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.currentProviderId = +id;
        this.loadProviderData(this.currentProviderId);
      }
    });
  }

  onSubmit(): void{
    if (this.providerForm.valid){
      if (this.isEditMode){
        this.updateProvider();
      } else {
        this.addProvider();
      }
    }
  }

  updateProvider(): void {
    if (this.currentProviderId !== null) {
      const update: Supplier = { ...this.providerForm.value, id: this.currentProviderId };
      this.providerService.updateProvider(update).subscribe(
        () => {
          Swal.fire({
            title: 'Proveedor actualizado!',
            text: 'El proveedor ha sido actualizado.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['/providers/list']);
        },
        (error) => {
          console.error('Error updating provider:', error);
          Swal.fire('Error', 'No se pudo actualizar el proveedor', 'error');
        }
      );
    }
  }

  addProvider(): void {
    this.providerService.addProvider(this.providerForm.value).subscribe(() => {
      Swal.fire({
        title: 'Proveedor agregado!',
        text: 'El proveedor ha sido agregado.',
        icon: 'success',
        timer: 2000, 
        showConfirmButton: false
      });
      this.resetForm();
      this.router.navigate(['/providers/list']);
    });
  }

  resetForm() {
    this.providerForm.reset();
    this.isEditMode = false;
    this.currentProviderId = null;
    this.router.navigate(['/providers/list']);
  }

  loadProviderData(id: number): void {
    this.providerService.getProviderById(id).subscribe(
      (provider: Supplier) => {
        this.providerForm.patchValue(provider);
      },
      (error) => {
        console.error('Error loading provider data:', error);
        Swal.fire('Error', 'No se pudo cargar los datos del proveedor', 'error');
      }
    );
  }
}
