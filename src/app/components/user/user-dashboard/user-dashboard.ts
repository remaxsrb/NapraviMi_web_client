import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AddProduct } from '../../products/add-product/add-product';
import { Header } from "../../common/header/header/header";
import { Navbar } from '../../common/navbar/navbar/navbar';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, AddProduct, Header, Navbar, RouterOutlet],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard {
  showAddProduct = false;
}
