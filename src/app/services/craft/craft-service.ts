import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, shareReplay } from 'rxjs';
import { CraftOption } from '../../interfaces/craft-option';

interface Craft {
  id: number;
  name: string;
  Keywords: string[];
  SearchKeywords: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CraftService {
  private apiUrl = 'http://localhost:8080/crafts';
  private crafts$;

  constructor(private http: HttpClient) {
    this.crafts$ = this.http.get<Craft[]>(`${this.apiUrl}/all`).pipe(shareReplay(1));
  }

  getCraftOptions() {
    return this.crafts$.pipe(
      map((crafts) =>
        crafts.map((c): CraftOption => ({
          label: c.name,
          value: c.name,
          keywords: [...(c.Keywords || []), ...(c.SearchKeywords || [])],
        })),
      ),
    );
  }
}
