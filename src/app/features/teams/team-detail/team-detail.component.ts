import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { F1Service } from '@core/services/f1.service';
import { Constructor, Driver } from '@core/models/driver.model';
import { RaceResult } from '@core/models/result.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl:'./team-detail.component.html',
  styleUrl: './team-detail.component.scss'
})
export class TeamDetailComponent implements OnInit {
  constructorId = '';
  teamConstructor: Constructor | null = null;
  isLoadingConstructor = true;
  error = '';
  
  teamDrivers: Driver[] = [];
  isLoadingDrivers = true;
  driversError = '';
  
  teamResults: RaceResult[] = [];
  isLoadingResults = true;
  resultsError = '';

  constructor(
    private route: ActivatedRoute,
    private f1Service: F1Service
  ) {}

  ngOnInit(): void {
    this.constructorId = this.route.snapshot.paramMap.get('id') || '';
    if (this.constructorId) {
      this.loadConstructorDetails();
    } else {
      this.error = 'Team ID is required';
      this.isLoadingConstructor = false;
    }
  }

  loadConstructorDetails(): void {
    this.isLoadingConstructor = true;
    this.error = '';

    this.f1Service.getConstructorDetails(this.constructorId).subscribe({
      next: (data) => {
        if (data.MRData.ConstructorTable.Constructors.length > 0) {
          this.teamConstructor = data.MRData.ConstructorTable.Constructors[0];
          this.loadTeamDrivers();
          this.loadTeamResults();
        } else {
          this.error = 'Team not found';
        }
        this.isLoadingConstructor = false;
      },
      error: (err) => {
        console.error('Error loading team details:', err);
        this.error = 'Unable to load team details. Please try again later.';
        this.isLoadingConstructor = false;
      }
    });
  }

  loadTeamDrivers(): void {
    this.isLoadingDrivers = true;
    this.driversError = '';
    
    const currentSeason = 2024;
    
    this.f1Service.getDriversBySeasonAndConstructor(currentSeason, this.constructorId).subscribe({
      next: (data) => {
        this.teamDrivers = data.MRData.DriverTable.Drivers;
        this.isLoadingDrivers = false;
      },
      error: (err) => {
        console.error('Error loading team drivers:', err);
        this.driversError = 'Unable to load team drivers. Please try again later.';
        this.isLoadingDrivers = false;
      }
    });
  }

  loadTeamResults(): void {
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
                    
                    // Check if constructor participated in this race
                    const constructorParticipated = raceResult.Results.some(
                      result => result.Constructor.constructorId === this.constructorId
                    );
                    
                    resolve(constructorParticipated ? raceResult : null);
                  } else {
                    resolve(null);
                  }
                },
                error: () => resolve(null)
              });
            });
          });
          
          Promise.all(resultRequests).then(results => {
            this.teamResults = results.filter((result): result is RaceResult => result !== null);
            this.isLoadingResults = false;
          });
        } else {
          this.teamResults = [];
          this.isLoadingResults = false;
        }
      },
      error: (err) => {
        console.error('Error loading race schedule:', err);
        this.resultsError = 'Unable to load team results. Please try again later.';
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

  // Create a flattened list of team result entries for display in the table
  getTeamResultEntries(): any[] {
    const entries: any[] = [];
    
    this.teamResults.forEach(race => {
      const teamResults = race.Results.filter(
        result => result.Constructor.constructorId === this.constructorId
      );
      
      teamResults.forEach(result => {
        entries.push({
          raceDate: race.date,
          raceName: race.raceName,
          driver: result.Driver,
          position: result.position,
          grid: result.grid,
          points: result.points
        });
      });
    });
    
    return entries;
  }
}