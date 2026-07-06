import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserGrowthChart } from './user-growth-chart/user-growth-chart';

@Component({
  selector: 'app-admin-dashboard-home',
  standalone: true,
  imports: [CommonModule, UserGrowthChart],
  templateUrl: './admin-dashboard-home.html',
  styleUrl: './admin-dashboard-home.css',
})
export class AdminDashboardHome {}
