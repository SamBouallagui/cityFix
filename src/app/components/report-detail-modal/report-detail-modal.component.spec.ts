import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDetailModalComponent } from './report-detail-modal.component';

describe('ReportDetailModalComponent', () => {
  let component: ReportDetailModalComponent;
  let fixture: ComponentFixture<ReportDetailModalComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
