import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeToastComponent } from './employee-toast.component';

describe('EmployeeToastComponent', () => {
  let component: EmployeeToastComponent;
  let fixture: ComponentFixture<EmployeeToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeToastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
