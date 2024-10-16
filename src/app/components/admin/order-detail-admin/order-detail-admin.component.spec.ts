import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailAdminComponent } from './order-detail-admin.component';

describe('OrderDetailAdminComponent', () => {
  let component: OrderDetailAdminComponent;
  let fixture: ComponentFixture<OrderDetailAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderDetailAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderDetailAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
