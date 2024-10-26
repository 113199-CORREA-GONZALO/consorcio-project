import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SidevarComponent } from "./sidevar/sidevar.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule, NgbDropdownModule, NgbCollapseModule, CommonModule, SidevarComponent]
})
export class AppComponent {
  title = 'consorcio-management';
  isMenuCollapsed = true;
}