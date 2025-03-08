import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-page-not-found',
    imports: [ RouterLink ],
    templateUrl: './page-not-found.component.html',
    styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object
      ) {}
    
      goBack() {
        if (isPlatformBrowser(this.platformId)) {
          window.history.back();
      }
    
    }

}
