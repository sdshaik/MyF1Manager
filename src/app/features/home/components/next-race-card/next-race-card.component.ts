import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Race } from '@core/models/race.model';

@Component({
  selector: 'app-next-race-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './next-race-card.component.html',
  styleUrl: './next-race-card.component.scss'
})
export class NextRaceCardComponent {
  @Input() race!: Race;

  formatDate(dateStr: string): string {
    if (!dateStr) return 'TBA';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return 'TBA';
    
    // API returns time in format "13:00:00Z"
    const timePart = timeStr.split('Z')[0];
    const [hours, minutes] = timePart.split(':');
    
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}