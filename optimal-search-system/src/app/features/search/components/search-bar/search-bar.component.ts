import {Component,OnInit,OnDestroy,Input ,Output,EventEmitter,ChangeDetectionStrategy} from '@angular/core'; 
import {FormControl,ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Subject} from 'rxjs';
import {takeUntil,distinctUntilChanged,debounceTime,filter} from 'rxjs/operators';
import {SearchConfig,DEFAULT_SEARCH_CONFIG} from '../../../../core/models/search.models';
@Component({//class is UI component
    selector:'app-search-bar',//<app-search-bar></app-search-bar>
    standalone:true,//can be independently used
    imports:[CommonModule,ReactiveFormsModule],
    changeDetection:ChangeDetectionStrategy.OnPush,
    //only update when inputs change
    //IF isFocused === true add class "focused" to the div
    // IF isFocused === false remove class "focused" from the div
    //aria-hidden if false means screen readers ignore this element 
    //aria-label provides a text description for screen readers
    //formControl object called searchControl is connect this input field[property binding]
    //focus waits for user to click or tab into input and blur waits for user leaves input (both are event bindings)
    //keydown listens for key presses and calls onKeydown method,$event contains info about key event like shift ,ctrl keys,enter,esc etc
    //autoComplete off prevents browser from showing previous search suggestions
    //type="search" - this input is meant for searching

    //@if- render this html only if condition is true

    template:`
    <div class="search-container" [class.focused]="isFocused">
        
        <span class="search-icon" aria-hidden="true">
            
            🔍
        </span>
            <input
            
            [formControl]="searchControl"
            [placeholder]="config.placeholder"
            (focus)="onFocus()"
            (blur)="onBlur()"
            (keydown)="onKeydown($event)"
            aria-label="Search input"
            class="search-input"
            type="text"
            autocomplete="off"
            />
            @if(searchControl.value){
                <button 
                type="button"
                class="clear-btn"
                (click)="clearSearch()"
                aria-label="Clear search">X</button>
            }
    </div>
            
    `,
    //flex-shrink=shrink items automatically according to avaiable space
    styles:[`
        .search-container{
            display:flex;
            align-items:center;
            gap:10px;
            padding:10px 16px;
            
            border-radius:8px;

            .search-container.focused{
                border-color:black;
            }
        }
        .search-icon{
            display:flex;
            align-items:center;
            font-size:18px;
        }
        .search-input{
            font-size:15px;
            width:100%;
            color:black;
            background:transparent;

        }
        .clear-btn{
            cursor:pointer;
            color:red;
            padding:2px;
            display:flex;
            align-items:center;
            font-size:14px;
            border-radius:50%;
            .clear-btn:hover{
                background-color:rgb(53, 20, 20);

            }
        }
        
        `]
})
//OnInit -runs code when the component starts ,useful for subscriptions
//onDestroy-runs cleanup when component dies(memory cleanup i.e cleanup subscription)
//@Input() allows parent component to pass data into this component
export class SearchBarComponent implements OnInit,OnDestroy{
    @Input() config:SearchConfig=DEFAULT_SEARCH_CONFIG;//config object with default values
    
    @Output() queryChange=new EventEmitter<string>();//emits search query changes to parent component
    @Output() searchSubmit=new EventEmitter<string>();//emits when user submits search (e.g presses enter)
    searchControl=new FormControl('');//form control for search input
    isFocused=false;//track if input is focused for styling
    private destroy$=new Subject<void>();//used to clean up subscriptions when component is destroyed to avoid memory leaks , when component is destroyed ,destroy.next() fires and takeUntil closes the pipe
    
    // valueChanges is an Observable that emits on every keystroke.
    // We pipe it through RxJS operators to transform the raw stream.
    ngOnInit(){
        this.searchControl.valueChanges.pipe(
            debounceTime(this.config.debounceMs),
            distinctUntilChanged(),
            filter(value=>(value??'').length>=this.config.minQueryLength||(value??'').length===0),//only emit if query length is greater than minQueryLength
            takeUntil(this.destroy$)
        ).subscribe(value=>{
            this.queryChange.emit(value??'');//emit query changes to parent component
        });
    }
    ngOnDestroy(): void {
        this.destroy$.next();//trigger cleanup of subscriptions
        this.destroy$.complete();
    }
    onFocus():void{
        this.isFocused=true;
    }
    onBlur():void{
        this.isFocused=false;
    }
    onKeydown(event:KeyboardEvent):void{
        if(event.key==='Enter'){
            this.searchSubmit.emit(this.searchControl.value ?? '');//emit search submit event to parent component
        }
        if(event.key==='Escape'){
            this.clearSearch();
        }
    }
    clearSearch():void{
        this.searchControl.patchValue('');
        this.queryChange.emit('');//emit empty query to parent component to clear results
    }
}

