import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { F1Service } from '@core/services/f1.service';
import { Race } from '@core/models/race.model';
import { RaceResult, Result } from '@core/models/result.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  races: Race[] = [];
  isLoadingRaces = true;
  
  raceResult: RaceResult | null = null;
  isLoadingResults = true;
  error = '';
  
  // Filter options
  selectedSeason = 2024;
  selectedRound = 1;
  availableYears: number[] = [];

  constructor(
    private f1Service: F1Service,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Generate available years (from 2000 to current year)
    const currentYear = 2024;
    for (let year = currentYear; year >= 2000; year--) {
      this.availableYears.push(year);
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['season']) {
        this.selectedSeason = parseInt(params['season'], 10);
      }
      
      this.loadRaces().then(() => {
        if (params['round']) {
          this.selectedRound = parseInt(params['round'], 10);
        } else if (this.races.length > 0) {
          // Select the most recent race that has happened
          const now = new Date();
          const pastRaces = this.races.filter(race => {
            const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
            return raceDate < now;
          });
          
          if (pastRaces.length > 0) {
            this.selectedRound = parseInt(pastRaces[pastRaces.length - 1].round, 10);
          } else {
            this.selectedRound = parseInt(this.races[0].round, 10);
          }
        }
        
        this.loadResults();
      });
    });
  }

  async loadRaces(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.isLoadingRaces = true;
      
      this.f1Service.getSeasonSchedule(this.selectedSeason).subscribe({
        next: (data) => {
          this.races = data.MRData.RaceTable.Races;
          this.isLoadingRaces = false;
          resolve();
        },
        error: (err) => {
          console.error('Error loading race schedule:', err);
          this.isLoadingRaces = false;
          resolve();
        }
      });
    });
  }

  onSeasonChange(): void {
    this.loadRaces().then(() => {
      if (this.races.length > 0) {
        this.selectedRound = parseInt(this.races[0].round, 10);
        this.loadResults();
      }
    });
  }

  loadResults(): void {
    this.isLoadingResults = true;
    this.error = '';

    // Update URL with current selections
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        season: this.selectedSeason,
        round: this.selectedRound
      },
      queryParamsHandling: 'merge'
    });

    this.f1Service.getRaceResults(this.selectedSeason, this.selectedRound).subscribe({
      next: (data) => {
        if (data.MRData.RaceTable.Races.length > 0) {
          this.raceResult = data.MRData.RaceTable.Races[0];
        } else {
          this.raceResult = null;
          this.error = 'No results found for this race.';
        }
        this.isLoadingResults = false;
      },
      error: (err) => {
        console.error('Error loading race results:', err);
        this.error = 'Unable to load race results. Please try again later.';
        this.isLoadingResults = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  hasFastestLaps(): boolean {
    if (!this.raceResult || !this.raceResult.Results) return false;
    
    return this.raceResult.Results.some(result => result.FastestLap);
  }

  getFastestLapsResults(): Result[] {
    if (!this.raceResult || !this.raceResult.Results) return [];
    
    const resultsWithFastestLap = this.raceResult.Results.filter(result => result.FastestLap);
    
    // Sort by fastest lap rank
    return resultsWithFastestLap.sort((a, b) => {
      const rankA = a.FastestLap ? parseInt(a.FastestLap.rank, 10) : 999;
      const rankB = b.FastestLap ? parseInt(b.FastestLap.rank, 10) : 999;
      return rankA - rankB;
    });
  }
}