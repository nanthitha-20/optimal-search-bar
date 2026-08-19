import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryDropdown } from './category-dropdown';

describe('CategoryDropdown', () => {
  let component: CategoryDropdown;
  let fixture: ComponentFixture<CategoryDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryDropdown],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryDropdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
