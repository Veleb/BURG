import { Component, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./core/navbar/navbar.component";
import { AuthenticateComponent } from "./authenticate/authenticate.component";
import { FooterComponent } from "./core/footer/footer.component";
import { UserService } from './user/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, AuthenticateComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'BURG';
  isTransparentNavbar = false;

  private router = inject(Router);
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isTransparentNavbar = ['/auth/register', '/auth/login'].includes(event.url);
      }
    });

    this.userService.getProfile().subscribe();

    if (isPlatformBrowser(this.platformId)) {
      this.initConsentLogic();
    }
  }

  private loadScriptOnce(src: string, globalFlag: string) {
    if ((window as any)[globalFlag]) return;
    (window as any)[globalFlag] = true;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (src.includes('tawk.to')) {
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
    }
    document.head.appendChild(script);
  }

  private loadTawk() {
    this.loadScriptOnce('https://embed.tawk.to/67a339123a8427326079f1ca/1ijapdt1h', 'tawkLoaded');
  }

  private loadGoogleGSI() {
    this.loadScriptOnce('https://accounts.google.com/gsi/client', 'googleGSILoaded');
  }

  private initConsentLogic() {
    window.addEventListener('UC_UI_INITIALIZED', () => {
      window.addEventListener('UC_UI_ACCEPT_ALL', () => {
        this.loadTawk();
        this.loadGoogleGSI();
      });

      window.addEventListener('UC_UI_CATEGORIES_ACCEPTED', (event: any) => {
        const categories = event.detail?.categories || [];
        if (categories.includes('functional')) {
          this.loadTawk();
          this.loadGoogleGSI();
        }
      });

      if ((window as any).Usercentrics?.getConsents) {
        (window as any).Usercentrics.getConsents().then((consents: any) => {
          if (consents.functional) {
            this.loadTawk();
            this.loadGoogleGSI();
          }
        });
      }
    });
  }
}
