import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from '../common/header/header/header';
import { Navbar } from '../common/navbar/navbar/navbar';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Navbar],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {}

