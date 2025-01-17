import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ RouterLink, RouterLinkActive ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(private userService: UserService) {}

  isMenuOpen: boolean = false;
  isAnimating: boolean = false;
 
  get isLogged(): boolean {
    return this.userService.isLogged;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.isAnimating = true;

    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }
  
}
