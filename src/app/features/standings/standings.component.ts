import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { F1Service } from '@core/services/f1.service';
import { DriverStanding } from '@core/models/driver.model';
import { ConstructorStanding } from '@core/models/constructor.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent, RouterLink],
  templateUrl: './standings.component.html',
  styleUrl: './standings.component.scss'
})
export class StandingsComponent implements OnInit {
  // Drivers standings
  driverStandings: DriverStanding[] = [];
  isLoadingDrivers = true;
  driversError = '';
  
  // Constructors standings
  constructorStandings: ConstructorStanding[] = [];
  isLoadingConstructors = true;
  constructorsError = '';
  
  // Filter options
  selectedSeason = 2024;
  selectedStandingType = 'drivers';
  availableYears: number[] = [];

  constructor(private f1Service: F1Service) {
    // Generate available years (from 2000 to current year)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
      this.availableYears.push(year);
    }
  }

  ngOnInit(): void {
    this.loadStandings();
  }

  loadStandings(): void {
    this.loadDriverStandings();
    this.loadConstructorStandings();
  }

  loadDriverStandings(): void {
    this.isLoadingDrivers = true;
    this.driversError = '';

    this.f1Service.getDriverStandings(this.selectedSeason).subscribe({
      next: (data) => {
        if (data.MRData.StandingsTable.StandingsLists.length > 0) {
          this.driverStandings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        } else {
          this.driverStandings = [];
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

  loadConstructorStandings(): void {
    this.isLoadingConstructors = true;
    this.constructorsError = '';

    this.f1Service.getConstructorStandings(this.selectedSeason).subscribe({
      next: (data) => {
        if (data.MRData.StandingsTable.StandingsLists.length > 0) {
          this.constructorStandings = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        } else {
          this.constructorStandings = [];
        }
        this.isLoadingConstructors = false;
      },
      error: (err) => {
        console.error('Error loading constructor standings:', err);
        this.constructorsError = 'Unable to load constructor standings. Please try again later.';
        this.isLoadingConstructors = false;
      }
    });
  }

  toggleStandingType(): void {
    // No need to reload data since we load both types on init and season change
  }
}