import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { RatingModule } from 'primeng/rating';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CraftsmanService } from '../../services/craftsman/craftsman-service';
import { CRAFT_OPTIONS, craftLabel } from '../../constants/craft-options';
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

interface ApiCraftsman {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  profile_picture: string;
  craft: string;
  rating: number;
  number_of_ratings: number;
}

@Component({
  selector: 'app-craftsmen-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, RatingModule, PaginatorModule],
  templateUrl: './craftsmen-overview.html',
  styleUrl: './craftsmen-overview.css',
})
export class CraftsmenOverview implements OnInit, OnChanges {
  @Input() craft: string | null = null;

  craftsmen: ApiCraftsman[] = [];
  isLoading = false;
  pageSize = 6;
  first = 0;
  totalRecords = 0;

  private craftsmanService = inject(CraftsmanService);

  ngOnInit(): void {
    this.loadCraftsmen();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['craft'] && !changes['craft'].firstChange) {
      this.first  = 0;
      this.loadCraftsmen();
    }
  }


  onPageChange(event: any): void {
    this.first = event.first;
    this.pageSize = event.rows;
    this.loadCraftsmen();
  }

  private loadCraftsmen(): void {
    this.isLoading = true;
    const params: any = {
        limit: this.pageSize,
        skip: this.first,
    };
    if (this.craft) {
      params['craft'] = this.craft;
    }

    this.craftsmanService.all(params).subscribe({
      next: (response: any) => {
        this.craftsmen = response?.data?.craftsmen || [];
        this.isLoading = false;
        this.totalRecords = response?.data?.total || 0;
      },
      error: () => {
        this.craftsmen = [];
        this.isLoading = false;
      },
    });
  }
}
