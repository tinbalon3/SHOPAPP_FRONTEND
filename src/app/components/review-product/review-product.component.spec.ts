import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewProductComponent } from './review-product.component';

describe('ReviewProductComponent', () => {
  let component: ReviewProductComponent;
  let fixture: ComponentFixture<ReviewProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReviewProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
