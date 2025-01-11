import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ RouterLink, RouterLinkActive ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false;
  isAnimating = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.isAnimating = true;

    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }
}
