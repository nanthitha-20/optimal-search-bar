import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryDropdownComponent } from './features/search/components/category-dropdown/category-dropdown';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, CategoryDropdownComponent],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    selectedItems: string[] = [];

    onSelectionChange(items: string[]): void {
        this.selectedItems = items;
        console.log('Selected:', items);
    }
}