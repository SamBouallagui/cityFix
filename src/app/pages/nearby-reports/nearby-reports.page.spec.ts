import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NearbyReportsPage } from './nearby-reports.page';

describe('NearbyReportsPage', () => {
  let component: NearbyReportsPage;
  let fixture: ComponentFixture<NearbyReportsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NearbyReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
