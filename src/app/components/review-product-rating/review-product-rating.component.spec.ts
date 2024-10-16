import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewProductRatingComponent } from './review-product-rating.component';

describe('ReviewProductRatingComponent', () => {
  let component: ReviewProductRatingComponent;
  let fixture: ComponentFixture<ReviewProductRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewProductRatingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReviewProductRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
