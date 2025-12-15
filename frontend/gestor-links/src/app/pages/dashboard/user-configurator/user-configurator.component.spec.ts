import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConfiguratorComponent } from './user-configurator.component';

describe('UserConfiguratorComponent', () => {
  let component: UserConfiguratorComponent;
  let fixture: ComponentFixture<UserConfiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserConfiguratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
