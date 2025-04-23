import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { F1Service } from '@core/services/f1.service';
import { Race } from '@core/models/race.model';
import { DriverStanding } from '@core/models/driver.model';
import { RaceResult } from '@core/models/result.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';
import { NextRaceCardComponent } from './components/next-race-card/next-race-card.component';
import { DriverStandingCardComponent } from './components/driver-standing-card/driver-standing-card.component';
import { RecentResultCardComponent } from './components/recent-result-card/recent-result-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    LoadingSpinnerComponent, 
    ErrorMessageComponent,
    NextRaceCardComponent,
    DriverStandingCardComponent,
    RecentResultCardComponent
  ],
  templateUrl:'./home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Races data
  nextRace: Race | null = null;
  isLoadingRaces = true;
  raceError = '';

  // Drivers data
  topDrivers: DriverStanding[] = [];
  isLoadingDrivers = true;
  driversError = '';

  // Results data
  recentResult: RaceResult | null = null;
  isLoadingResults = true;
  resultsError = '';

  constructor(private f1Service: F1Service) {}

  ngOnInit(): void {
    this.loadNextRace();
    this.loadTopDrivers();
    this.loadRecentResults();
  }

  loadNextRace(): void {
    this.isLoadingRaces = true;
    this.f1Service.getCurrentSeasonSchedule().subscribe({
      next: (data) => {
        const now = new Date();
        this.nextRace = data.MRData.RaceTable.Races.find(race => {
          const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
          return raceDate > now;
        }) || null;
        this.isLoadingRaces = false;
      },
      error: (err) => {
        console.error('Error loading race schedule:', err);
        this.raceError = 'Unable to load race schedule. Please try again later.';
        this.isLoadingRaces = false;
      }
    });
  }

  loadTopDrivers(): void {
    this.isLoadingDrivers = true;
    this.f1Service.getCurrentDriverStandings().subscribe({
      next: (data) => {
        if (data.MRData.StandingsTable.StandingsLists.length > 0) {
          this.topDrivers = data.MRData.StandingsTable.StandingsLists[0].DriverStandings.slice(0, 3);
        }
        this.isLoadingDrivers = false;
      },
      error: (err) => {
        console.error('Error loading driver standings:', err);
        this.driversError = 'Unable to load driver standings. Please try again later.';
        this.isLoadingDrivers = false;
      }
    });
  }

  loadRecentResults(): void {
    this.isLoadingResults = true;
    const currentSeason = 2024;
    
    this.f1Service.getCurrentSeasonSchedule().subscribe({
      next: (data) => {
        const now = new Date();
        console.log(data);
        console.log(now);
        const pastRaces = data.MRData.RaceTable.Races.filter(race => {
          const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
          return raceDate < now;
        });
        
        if (pastRaces.length > 0) {
          const mostRecentRace = pastRaces[pastRaces.length - 1];
          const round = parseInt(mostRecentRace.round, 10);
          
          this.f1Service.getRaceResults(currentSeason, round).subscribe({
            next: (resultsData) => {
              if (resultsData.MRData.RaceTable.Races.length > 0) {
                this.recentResult = resultsData.MRData.RaceTable.Races[0];
              }
              this.isLoadingResults = false;
            },
            error: (err) => {
              console.error('Error loading race results:', err);
              this.resultsError = 'Unable to load race results. Please try again later.';
              this.isLoadingResults = false;
            }
          });
        } else {
          this.isLoadingResults = false;
        }
      },
      error: (err) => {
        console.error('Error loading race schedule:', err);
        this.resultsError = 'Unable to load race results. Please try again later.';
        this.isLoadingResults = false;
      }
    });
  }
}