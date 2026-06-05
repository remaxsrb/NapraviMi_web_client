import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { RatingModule } from 'primeng/rating';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { CraftsmanService } from '../../services/craftsman/craftsman-service';

const CRAFT_OPTIONS = [
  { label: 'Kovač', value: 'blacksmith' },
  { label: 'Duborezac', value: 'woodcarver' },
  { label: 'Obućar', value: 'shoemaker' },
  { label: 'Grnčar', value: 'potter' },
  { label: 'Bačvar', value: 'cooper' },
];

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
  imports: [CommonModule, FormsModule, CardModule, RatingModule],
  templateUrl: './craftsmen-overview.html',
  styleUrl: './craftsmen-overview.css',
})
export class CraftsmenOverview implements OnChanges {
  @Input() craft: string | null = null;

  craftsmen: ApiCraftsman[] = [];
  isLoading = false;

  private craftsmanService = inject(CraftsmanService);

  ngOnChanges(_changes: SimpleChanges): void {
    this.loadCraftsmen();
  }

  craftLabel(value: string): string {
    return CRAFT_OPTIONS.find((c) => c.value === value)?.label ?? value;
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
        this.isLoading = false;
      },
      error: () => {
        this.craftsmen = [];
        this.isLoading = false;
      },
    });
  }
}
