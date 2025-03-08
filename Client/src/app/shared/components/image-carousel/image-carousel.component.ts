import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-carousel',
  imports: [],
  templateUrl: './image-carousel.component.html',
  styleUrl: './image-carousel.component.css'
})
export class ImageCarouselComponent {

  @Input() images: string[] = [];

  constructor() { }

  currentIndex = 0;

  nextImage(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevImage(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  setImage(index: number): void {
    this.currentIndex = index;
  }

  isCurrentImage(index: number): boolean {
    return index === this.currentIndex;
  }

  get currentImage(): string {
    return this.images[this.currentIndex];
  }

}
