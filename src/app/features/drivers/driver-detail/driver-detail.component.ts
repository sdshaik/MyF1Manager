import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { F1Service } from '@core/services/f1.service';
import { Driver } from '@core/models/driver.model';
import { RaceResult } from '@core/models/result.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';

@Component({
  selector: 'app-driver-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './driver-detail.component.html',
  styleUrl: './driver-detail.component.scss'
})
export class DriverDetailComponent implements OnInit {
  driverId = '';
  driver: Driver | null = null;
  isLoadingDriver = true;
  error = '';
  
  driverResults: RaceResult[] = [];
  isLoadingResults = true;
  resultsError = '';

  constructor(
    private route: ActivatedRoute,
    private f1Service: F1Service
  ) {}

  ngOnInit(): void {
    this.driverId = this.route.snapshot.paramMap.get('id') || '';
    if (this.driverId) {
      this.loadDriverDetails();
    } else {
      this.error = 'Driver ID is required';
      this.isLoadingDriver = false;
    }
  }

  loadDriverDetails(): void {
    this.isLoadingDriver = true;
    this.error = '';

    this.f1Service.getDriverDetails(this.driverId).subscribe({
      next: (data) => {
        if (data.MRData.DriverTable.Drivers.length > 0) {
          this.driver = data.MRData.DriverTable.Drivers[0];
          this.loadDriverResults();
        } else {
          this.error = 'Driver not found';
        }
        this.isLoadingDriver = false;
      },
      error: (err) => {
        console.error('Error loading driver details:', err);
        this.error = 'Unable to load driver details. Please try again later.';
        this.isLoadingDriver = false;
      }
    });
  }

  loadDriverResults(): void {
    this.isLoadingResults = true;
    this.resultsError = '';
    
    const currentSeason = 2024;
    
    // Get the current season's schedule
    this.f1Service.getSeasonSchedule(currentSeason).subscribe({
      next: (scheduleData) => {
        const races = scheduleData.MRData.RaceTable.Races;
        const now = new Date();
        
        // Filter past races
        const pastRaces = races.filter(race => {
          const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
          return raceDate < now;
        });
        
        if (pastRaces.length > 0) {
          // Get results for the most recent races (up to 5)
          const recentRaces = pastRaces.slice(-5).reverse();
          
          const resultRequests = recentRaces.map(race => {
            const season = parseInt(race.season, 10);
            const round = parseInt(race.round, 10);
            
            return new Promise<RaceResult | null>((resolve) => {
              this.f1Service.getRaceResults(season, round).subscribe({
                next: (resultsData) => {
                  if (resultsData.MRData.RaceTable.Races.length > 0) {
                    const raceResult = resultsData.MRData.RaceTable.Races[0];
                    
                    // Check if driver participated in this race
                    const driverParticipated = raceResult.Results.some(
                      result => result.Driver.driverId === this.driverId
                    );
                    
                    resolve(driverParticipated ? raceResult : null);
                  } else {
                    resolve(null);
                  }
                },
                error: () => resolve(null)
              });
            });
          });
          
          Promise.all(resultRequests).then(results => {
            this.driverResults = results.filter((result): result is RaceResult => result !== null);
            this.isLoadingResults = false;
          });
        } else {
          this.driverResults = [];
          this.isLoadingResults = false;
        }
      },
      error: (err) => {
        console.error('Error loading race schedule:', err);
        this.resultsError = 'Unable to load driver results. Please try again later.';
        this.isLoadingResults = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getConstructorName(raceResult: RaceResult): string {
    if (!raceResult.Results) return 'N/A';
    
    const driverResult = raceResult.Results.find(
      result => result.Driver.driverId === this.driverId
    );
    
    return driverResult ? driverResult.Constructor.name : 'N/A';
  }

  getDriverGrid(raceResult: RaceResult): string {
    if (!raceResult.Results) return 'N/A';
    
    const driverResult = raceResult.Results.find(
      result => result.Driver.driverId === this.driverId
    );
    
    return driverResult ? driverResult.grid : 'N/A';
  }

  getDriverPosition(raceResult: RaceResult): string {
    if (!raceResult.Results) return 'N/A';
    
    const driverResult = raceResult.Results.find(
      result => result.Driver.driverId === this.driverId
    );
    
    return driverResult ? driverResult.position : 'N/A';
  }

  getDriverPoints(raceResult: RaceResult): string {
    if (!raceResult.Results) return 'N/A';
    
    const driverResult = raceResult.Results.find(
      result => result.Driver.driverId === this.driverId
    );
    
    return driverResult ? driverResult.points : 'N/A';
  }
}