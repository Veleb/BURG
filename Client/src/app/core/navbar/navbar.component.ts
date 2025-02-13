import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../user/user.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CurrencyComponent } from "../../currency/currency.component";

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, AsyncPipe, CurrencyComponent],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  
  isLoggedIn$: Observable<boolean>;
  
  constructor(private userService: UserService) {
    this.isLoggedIn$ = this.userService.isLogged$;
  }
  
  isMenuOpen: boolean = false;
  isAnimating: boolean = false;

  toggleMenu(): void {
    
    this.isMenuOpen = !this.isMenuOpen;
    this.isAnimating = true;

    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }
  
}
