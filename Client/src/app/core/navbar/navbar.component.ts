import { Component, Input, HostListener, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../user/user.service';
import { Observable, combineLatest } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CurrencyComponent } from "../../currency/currency.component";
import { trigger, transition, style, animate } from '@angular/animations';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { VehicleInterface } from '../../../types/vehicle-types';
import { UserFromDB } from '../../../types/user-types';

@Component({
  selector: 'app-navbar',
  standalone: true,
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
export class NavbarComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  @Input() isTransparent = false;
  @ViewChild('navMenu') navMenu!: ElementRef;

  vm$!: Observable<{ isLoggedIn: boolean; user: UserFromDB | null }>;
  isMenuOpen = false;

  ngOnInit(): void {
    this.vm$ = combineLatest({
      isLoggedIn: this.userService.isLogged$,
      user: this.userService.user$
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.navMenu?.nativeElement && !this.navMenu.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }

  handleSelectedVehicle(vehicle: VehicleInterface): void {
    this.router.navigate(['/catalog', vehicle._id]);
  }
}