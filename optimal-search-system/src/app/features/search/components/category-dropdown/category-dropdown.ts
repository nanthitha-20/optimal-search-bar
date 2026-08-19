import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SearchResult, SearchApiResponse } from '../../../../core/models/search.models';

@Component({
    selector: 'app-category-dropdown',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ScrollingModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="dropdown-wrapper" (click)="onWrapperClick($event)">

            <button
                type="button"
                class="dropdown-trigger"
                (click)="toggleDropdown()"
            >
                <span class="trigger-label">{{ triggerLabel }}</span>
                @if (selectedWords.length > 1) {
                    <span class="trigger-count">{{ selectedWords.length - 1 }}+</span>
                }
                <span class="arrow">{{ isOpen ? '▲' : '▼' }}</span>
            </button>

            @if (isOpen) {
                <div class="dropdown-panel">

                    <div class="dropdown-search">
                        <span class="search-icon">🔍</span>
                        <input
                            [formControl]="searchControl"
                            placeholder="Search here..."
                            type="text"
                            autocomplete="off"
                            autocorrect="off"
                            spellcheck="false"
                            class="dropdown-search-input"
                        />
                        @if (selectedWords.length > 0) {
                            <button
                                type="button"
                                class="clear-btn"
                                (click)="clearAll($event)"
                            >✕</button>
                        }
                    </div>

                    @if (selectedWords.length > 0) {
                        <div class="selected-tags">
                            @for (word of selectedWords; track word) {
                                <span class="tag">
                                    {{ word }}
                                    <button
                                        type="button"
                                        class="tag-remove"
                                        (click)="toggleWord(word)"
                                    >✕</button>
                                </span>
                            }
                        </div>
                    }

                    @if (isLoading && results.length === 0) {
                        <div class="dropdown-state">Searching...</div>
                    }

                    @if (!isLoading && results.length === 0) {
                        <div class="dropdown-state">No results found</div>
                    }

                    @if (results.length > 0) {
                        <cdk-virtual-scroll-viewport
                            #viewport
                            itemSize="44"
                            class="dropdown-list"
                            (scrolledIndexChange)="onScrolledIndexChange($event)"
                        >
                            <div
                                *cdkVirtualFor="let result of results; trackBy: trackByWord"
                                class="dropdown-item"
                                [class.active]="isSelected(result.word)"
                                (click)="toggleWord(result.word)"
                            >
                                {{ result.word }}
                            </div>
                        </cdk-virtual-scroll-viewport>
                    }

                    @if (isLoadingMore) {
                        <div class="dropdown-state small">Loading more...</div>
                    }

                    @if (!hasMore && results.length > 0) {
                        <div class="dropdown-end">All results loaded</div>
                    }

                </div>
            }

        </div>
    `,
    styles: [`
        .dropdown-wrapper {
            position: relative;
            display: inline-block;
        }

        .dropdown-trigger {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 16px;
            background: white;
            border: 1px solid #d0d0d0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            color: #333;
            min-width: 200px;
            transition: border-color 0.2s;

            &:hover {
                border-color: #1a6b5a;
            }
        }

        .trigger-label {
            flex: 1;
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .trigger-count {
            background: #1a6b5a;
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 7px;
            border-radius: 10px;
            white-space: nowrap;
        }

        .arrow {
            font-size: 10px;
            color: #666;
        }

        .dropdown-panel {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 2px;
            background: white;
            border: 1px solid #d0d0d0;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            min-width: 250px;
            z-index: 1000;
            overflow: hidden;
        }

        .dropdown-search {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            border-bottom: 1px solid #f0f0f0;
            background: #fafafa;
        }

        .search-icon {
            font-size: 14px;
        }

        .dropdown-search-input {
            border: none;
            outline: none;
            font-size: 13px;
            width: 100%;
            background: transparent;
            color: #333;
        }

        .clear-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #999;
            font-size: 12px;
            padding: 2px 4px;
            border-radius: 4px;
            flex-shrink: 0;

            &:hover {
                color: #333;
                background: #f0f0f0;
            }
        }

        .selected-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 8px 12px;
            border-bottom: 1px solid #f0f0f0;
            background: #f9fffe;
            max-height: 80px;
            overflow-y: auto;
        }

        .tag {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #1a6b5a;
            color: white;
            font-size: 12px;
            padding: 3px 8px;
            border-radius: 12px;
        }

        .tag-remove {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 10px;
            padding: 0;
            opacity: 0.8;
            line-height: 1;

            &:hover { opacity: 1; }
        }

        .dropdown-list {
            height: 300px;
        }

        .dropdown-item {
            height: 44px;
            display: flex;
            align-items: center;
            padding: 0 16px;
            font-size: 14px;
            color: #333;
            cursor: pointer;
            transition: background 0.15s;
            border-bottom: 1px solid #f5f5f5;
            box-sizing: border-box;

            &:hover { background: #f0f0f0; }

            &.active {
                background: #1a6b5a;
                color: white;
                font-weight: 500;
            }
        }

        .dropdown-state {
            padding: 16px;
            text-align: center;
            color: #888;
            font-size: 13px;

            &.small {
                padding: 8px;
                font-size: 11px;
            }
        }

        .dropdown-end {
            padding: 8px 16px;
            text-align: center;
            color: #bbb;
            font-size: 11px;
            border-top: 1px solid #f0f0f0;
        }
    `]
})
export class CategoryDropdownComponent implements OnInit, OnDestroy {

    @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

    @Input() endpoint: string = 'http://localhost:8080/v1/search';
    @Input() multiSelect: boolean = true;
    @Input() defaultSelected: string[] = [];
    @Output() selectionChange = new EventEmitter<string[]>();

    searchControl = new FormControl('');
    results: SearchResult[] = [];
    selectedWords: string[] = [];
    isOpen = false;
    isLoading = false;
    isLoadingMore = false;
    hasMore = true;

    private currentQuery = '';
    private currentStart = 0;
    private readonly limit = 20;
    private destroy$ = new Subject<void>();

    constructor(
        private http: HttpClient,
        private cdr: ChangeDetectorRef
    ) {}

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        const wrapper = target.closest('app-category-dropdown');
        if (!wrapper) {
            this.isOpen = false;
            this.cdr.detectChanges();
        }
    }

    onWrapperClick(event: Event): void {
        event.stopPropagation();
    }

    ngOnInit(): void {
        this.selectedWords = [...this.defaultSelected];

        this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter(value => (value ?? '').length === 0 || (value ?? '').length >= 3),
    takeUntil(this.destroy$)
).subscribe(value => {
    this.resetAndSearch(value ?? '');
});
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get triggerLabel(): string {
        if (this.selectedWords.length === 0) return 'Select...';
        return this.selectedWords[0];
    }

    isSelected(word: string): boolean {
        return this.selectedWords.includes(word);
    }

    toggleWord(word: string): void {
        if (!this.multiSelect) {
            this.selectedWords = this.isSelected(word) ? [] : [word];
        } else {
            const index = this.selectedWords.indexOf(word);
            if (index === -1) {
                this.selectedWords = [...this.selectedWords, word];
            } else {
                this.selectedWords = this.selectedWords.filter(w => w !== word);
            }
        }
        this.selectionChange.emit(this.selectedWords);
        this.cdr.detectChanges();
    }

    clearAll(event: Event): void {
        event.stopPropagation();
        this.selectedWords = [];
        this.selectionChange.emit(this.selectedWords);
        this.cdr.detectChanges();
    }

    trackByWord(index: number, result: SearchResult): string {
        return result.word;
    }

    resetAndSearch(query: string): void {
        this.currentQuery = query;
        this.currentStart = 0;
        this.results = [];
        this.hasMore = true;
        this.loadResults();
    }

    loadResults(): void {
        if (this.currentStart === 0) {
            this.isLoading = true;
        } else {
            this.isLoadingMore = true;
        }
        this.cdr.detectChanges();

        const params = new HttpParams()
            .set('q', this.currentQuery)
            .set('limit', this.limit.toString())
            .set('st', this.currentStart.toString());

        this.http.get<SearchApiResponse>(this.endpoint, { params }).pipe(
        ).subscribe({
            next: (response) => {
                const newResults = response.results;
                if (newResults.length < this.limit) {
                    this.hasMore = false;
                }
                this.results = [...this.results, ...newResults];
                this.currentStart += newResults.length;
                this.isLoading = false;
                this.isLoadingMore = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoading = false;
                this.isLoadingMore = false;
                this.cdr.detectChanges();
            }
        });
    }

    onScrolledIndexChange(index: number): void {
        if (!this.viewport) return;
        const end = this.viewport.getRenderedRange().end;
        if (end >= this.results.length - 5 && !this.isLoadingMore && this.hasMore) {
            this.loadResults();
        }
    }

    toggleDropdown(): void {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.resetAndSearch('');
        } else {
            this.searchControl.patchValue('');
            this.results = [];
            this.currentStart = 0;
            this.hasMore = true;
        }
        this.cdr.detectChanges();
    }
}