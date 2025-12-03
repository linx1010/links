import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialIndicatorsComponent } from './financial-indicators.component';

describe('FinancialIndicatorsComponent', () => {
  let component: FinancialIndicatorsComponent;
  let fixture: ComponentFixture<FinancialIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialIndicatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
