import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShippedOrdersChart } from './shipped-orders-chart/shipped-orders-chart';

@Component({
  selector: 'app-homepage-welcome',
  imports: [CommonModule, ShippedOrdersChart],
  templateUrl: './homepage-welcome.html',
  styleUrl: './homepage-welcome.css',
})
export class HomepageWelcome {}
