import { Component } from '@angular/core';

@Component({
    selector: 'app-contact',
    imports: [],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.css'
})
export class ContactComponent {

    onSubmit() {
        alert('Thank you for your message! We will get back to you soon.');
    }
    
}
