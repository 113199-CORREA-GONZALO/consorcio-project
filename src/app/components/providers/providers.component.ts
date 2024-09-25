import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProvidersService } from '../../services/providers.service';
import { Supplier } from '../../models/supplier.model';
import { ServiceType } from '../../models/enums/service-tpye.enum';
import { StatusType } from '../../models/enums/status-type.enum';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.css'],
  providers: [ProvidersService]
})
export class ProvidersComponent {
  providerForm: FormGroup;
  providers: Supplier[] = [];
  isEditMode = false;
  currentProviderId: number | null = null;

  serviceTypes = Object.values(ServiceType);
  statusTypes = Object.values(StatusType);

  constructor(private fb: FormBuilder, private providersService: ProvidersService) {
    this.providerForm = this.fb.group({
      name: ['', Validators.required],
      serviceType: ['', Validators.required],
      contact: ['', Validators.required],
      address: ['', Validators.required],
      details: ['', Validators.required],
      state: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getProviders();
  }

  getProviders(): void {
    this.providersService.getProviders().subscribe((providers) => {
      this.providers = providers;
    });
  }

  onSubmit(): void {
    if (this.providerForm.valid) {
      if (this.isEditMode) {
        this.updateProvider();
      } else {
        this.addProvider();
      }
    }
  }

  addProvider(): void {
    this.providersService.addProvider(this.providerForm.value).subscribe(() => {
      this.getProviders();
      this.providerForm.reset();
    });
  }

  updateProvider(): void {
    if (this.currentProviderId !== null) {
      const updatedProvider = { ...this.providerForm.value, id: this.currentProviderId };
      this.providersService.updateProvider(updatedProvider).subscribe(() => {
        this.getProviders();
        this.providerForm.reset();
        this.isEditMode = false;
        this.currentProviderId = null;
      });
    }
  }

  editProvider(provider: Supplier): void {
    this.providerForm.patchValue(provider);
    this.isEditMode = true;
    this.currentProviderId = provider.id;
  }

  deleteProvider(id: number): void {
    this.providersService.deleteProvider(id).subscribe(() => {
      this.getProviders();
    });
  }

  cancelEdit(): void {
    this.providerForm.reset();
    this.isEditMode = false;
    this.currentProviderId = null;
  }
}
