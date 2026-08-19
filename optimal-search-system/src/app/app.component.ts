import {Component} from '@angular/core';
import {SearchBarComponent} from './features/search/components/search-bar/search-bar.component';
@Component({
    selector:'app-root',//<app-root></app-root>
    standalone:true,//can be independently used
    imports:[SearchBarComponent],
    template:`
    <div class ="app-shell">
        <header class="app-header">
            <div class ="logo">
                <strong> zoho </strong> Search
            </div>
            <div class="search-wrapper">
                <app-search-bar
                (queryChange)="onQueryChange($event)"
                (searchSubmit)="onSearchSubmit($event)"
                />
            </div>
        </header>
        <main>
            <p> current query:{{currentQuery}} </p>
        </main>
    </div>
    `,
    styles:[`
        .app-shell{
            font-family:Arial,sans-serif;
            height:100vh;
            background:purple;
            color:white;
            display:flex;
        }
        .app-header{
            background:darkblue;
            padding:20px;
            display:flex;
            align-items:center;
            gap:20px;
            box-shadow:0 2px 4px rgba(0,0,0,0.1);
        }
        .logo{
            font-size:18px;
            color:grey;
            white-space:nowrap;
        }
        .search-wrapper{
            flex:1;
            max-width:600px;
        }
    `]
})
export class AppComponent{
    currentQuery:string='';
    onQueryChange(query:string):void{
        this.currentQuery=query;
        console.log('Query changed:',query);
    }
    onSearchSubmit(query:string):void{
        console.log('Search submitted:',query);
    }

}