import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RaceResult } from '@core/models/result.model';

import { faTrophy, faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-recent-result-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './recent-result-card.component.html',
  styleUrl: './recent-result-card.component.scss'
})
export class RecentResultCardComponent {
  @Input() result!: RaceResult;

  faTrophy = faTrophy;
  faAward = faAward;

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getPodiumPositions() {
    if (!this.result.Results || this.result.Results.length === 0) {
      return [];
    }
    
    
    // Sort by position and take top 3
    return this.result.Results
      .sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10))
      .slice(0, 3);
  }

  getPodiumPosition(position: string) {
    return this.result?.Results?.find(p => p.position === position);
  }
  
}