import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationMetricsComponent } from './operation-metrics.component';

describe('OperationMetricsComponent', () => {
  let component: OperationMetricsComponent;
  let fixture: ComponentFixture<OperationMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
