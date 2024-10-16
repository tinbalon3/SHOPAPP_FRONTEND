import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyEmailSuccessfullyComponent } from './verify-email-successfully.component';

describe('VerifyEmailSuccessfullyComponent', () => {
  let component: VerifyEmailSuccessfullyComponent;
  let fixture: ComponentFixture<VerifyEmailSuccessfullyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerifyEmailSuccessfullyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerifyEmailSuccessfullyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
