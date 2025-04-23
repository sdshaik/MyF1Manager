import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { F1Service } from '@core/services/f1.service';
import { Race } from '@core/models/race.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent, RouterModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent implements OnInit {
  races: Race[] = [];
  filteredRaces: Race[] = [];
  isLoading = true;
  error = '';
  
  // Filter options
  selectedSeason = 2024;
  selectedFilter = 'all';
  availableYears: number[] = [];

  constructor(private f1Service: F1Service) {
    // Generate available years (from 2000 to current year)
    const currentYear = 2024;
    for (let year = currentYear; year >= 2000; year--) {
      this.availableYears.push(year);
    }
  }

  ngOnInit(): void {
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.isLoading = true;
    this.error = '';

    this.f1Service.getSeasonSchedule(this.selectedSeason).subscribe({
      next: (data) => {
        this.races = data.MRData.RaceTable.Races;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading race schedule:', err);
        this.error = 'Unable to load race schedule. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const now = new Date();

    switch (this.selectedFilter) {
      case 'upcoming':
        this.filteredRaces = this.races.filter(race => {
          const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
          return raceDate > now;
        });
        break;
      case 'past':
        this.filteredRaces = this.races.filter(race => {
          const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
          return raceDate < now;
        });
        break;
      default:
        this.filteredRaces = [...this.races];
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'TBA';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  formatFullDate(dateStr: string): string {
    if (!dateStr) return 'TBA';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return 'Time TBA';
    
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

  getRaceStatus(race: Race): string {
    const now = new Date();
    const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
    
    if (raceDate < now) {
      return 'Completed';
    }
    
    // Find the next upcoming race
    const upcomingRaces = this.races.filter(r => {
      const d = new Date(`${r.date}T${r.time || '00:00:00Z'}`);
      return d > now;
    });
    
    if (upcomingRaces.length > 0 && upcomingRaces[0].round === race.round) {
      return 'Next Race';
    }
    
    return 'Upcoming';
  }

  getRaceStatusClass(race: Race): string {
    const status = this.getRaceStatus(race);
    
    switch (status) {
      case 'Completed':
        return 'race-status status-completed';
      case 'Next Race':
        return 'race-status status-next-race';
      default:
        return 'race-status status-upcoming';
    }
  }

  isPastRace(race: Race): boolean {
    const now = new Date();
    const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
    return raceDate < now;
  }
}