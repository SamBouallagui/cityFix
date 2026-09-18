import { TestBed } from '@angular/core/testing';
import { Zones } from './zones';

describe('Zones', () => {
  let service: Zones;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Zones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
