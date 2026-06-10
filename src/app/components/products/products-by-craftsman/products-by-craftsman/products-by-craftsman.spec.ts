import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsByCraftsman } from './products-by-craftsman';

describe('ProductsByCraftsman', () => {
  let component: ProductsByCraftsman;
  let fixture: ComponentFixture<ProductsByCraftsman>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsByCraftsman],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsByCraftsman);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
