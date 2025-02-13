import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./core/navbar/navbar.component";
import { AuthenticateComponent } from "./authenticate/authenticate.component";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent, AuthenticateComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'BURG';
}
