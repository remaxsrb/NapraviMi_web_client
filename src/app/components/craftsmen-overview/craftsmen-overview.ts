import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { RatingModule } from 'primeng/rating';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { CraftsmanService } from '../../services/craftsman/craftsman-service';
import { CRAFT_OPTIONS, craftLabel } from '../../constants/craft-options';

interface ApiCraftsman {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  craftsman: {
    craft: string;
    rating: number;
    number_of_ratings: number;
  };
}

@Component({
  selector: 'app-craftsmen-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, RatingModule, PaginatorModule],
  templateUrl: './craftsmen-overview.html',
  styleUrl: './craftsmen-overview.css',
})
export class CraftsmenOverview implements OnChanges {
  @Input() craft: string | null = null;

  craftsmen: ApiCraftsman[] = [];
  pagedCraftsmen: ApiCraftsman[] = [];
  isLoading = false;
  pageSize = 6;
  first = 0;

  craftLabel = craftLabel;

  private craftsmanService = inject(CraftsmanService);

  ngOnChanges(_changes: SimpleChanges): void {
    this.loadCraftsmen();
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.pageSize = event.rows;
    this.pagedCraftsmen = this.craftsmen.slice(this.first, this.first + this.pageSize);
  }

  private loadCraftsmen(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.craft) {
      params['craft'] = this.craft;
    }

    this.craftsmanService.all(params).subscribe({
      next: (response: any) => {
        this.craftsmen = response?.data?.craftsmen ?? response?.craftsmen ?? [];
        this.first = 0;
        this.pagedCraftsmen = this.craftsmen.slice(0, this.pageSize);
        this.isLoading = false;
      },
      error: () => {
        this.craftsmen = [];
        this.isLoading = false;
      },
    });
  }
}
