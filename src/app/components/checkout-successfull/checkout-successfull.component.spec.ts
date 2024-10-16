import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutSuccessfullComponent } from './checkout-successfull.component';

describe('CheckoutSuccessfullComponent', () => {
  let component: CheckoutSuccessfullComponent;
  let fixture: ComponentFixture<CheckoutSuccessfullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutSuccessfullComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckoutSuccessfullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
