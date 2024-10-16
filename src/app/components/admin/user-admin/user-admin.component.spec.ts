import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAdminComponent } from './user-admin.component';

describe('UserAdminComponent', () => {
  let component: UserAdminComponent;
  let fixture: ComponentFixture<UserAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
