import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitizenHomePage } from './citizen-home.page';

describe('CitizenHomePage', () => {
  let component: CitizenHomePage;
  let fixture: ComponentFixture<CitizenHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CitizenHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
