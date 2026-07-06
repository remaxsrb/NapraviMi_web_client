import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Header } from '../../common/header/header/header';
import { Navbar } from '../../common/navbar/navbar/navbar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterOutlet, Header, Navbar],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {}
