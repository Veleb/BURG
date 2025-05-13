import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./core/navbar/navbar.component";
import { AuthenticateComponent } from "./authenticate/authenticate.component";
import { FooterComponent } from "./core/footer/footer.component";
import { UserService } from './user/user.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent, AuthenticateComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'BURG';

  isTransparentNavbar = false;

  private router = inject(Router);
  private userService = inject(UserService);

  ngOnInit(): void {
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isTransparentNavbar = ['/auth/register', '/auth/login'].includes(event.url);
      }
    });
    
    this.userService.getProfile().subscribe();

  }

}
