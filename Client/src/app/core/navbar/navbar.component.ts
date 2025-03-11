import { Component, Input, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../user/user.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CurrencyComponent } from "../../currency/currency.component";
import { trigger, transition, style, animate } from '@angular/animations';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { VehicleInterface } from '../../../types/vehicle-types';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AsyncPipe, CurrencyComponent, SearchBarComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [
    trigger('iconAnimation', [
      transition('closed => open', [
        style({ transform: 'rotate(0deg)' }),
        animate('0.3s ease', style({ transform: 'rotate(180deg)' }))
      ]),
      transition('open => closed', [
        style({ transform: 'rotate(180deg)' }),
        animate('0.3s ease', style({ transform: 'rotate(0deg)' }))
      ])
    ])
  ]
})
export class NavbarComponent {
  @Input() isTransparent: boolean = false;
  @ViewChild('navMenu') navMenu!: ElementRef;
  isLoggedIn$: Observable<boolean>;
  isMenuOpen: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
  ) {
    this.isLoggedIn$ = this.userService.isLogged$;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.navMenu.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }

  handleSelectedVehicle(vehicle: VehicleInterface): void {
    this.router.navigate(['/catalog', vehicle._id]);
    
    
  }
}