import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DriverStanding } from '@core/models/driver.model';

@Component({
  selector: 'app-driver-standing-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './driver-standing-card.component.html',
  styleUrl: './driver-standing-card.component.scss'
})
export class DriverStandingCardComponent {
  @Input() driver!: DriverStanding;

  getPositionClass(): string {
    const position = parseInt(this.driver.position, 10);
    if (position === 1) return 'position-1';
    if (position === 2) return 'position-2';
    if (position === 3) return 'position-3';
    return 'position-other';
  }
}