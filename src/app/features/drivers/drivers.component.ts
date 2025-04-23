import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { F1Service } from '@core/services/f1.service';
import { Driver } from '@core/models/driver.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl:'./drivers.component.html',
  styleUrl: './drivers.component.scss'
})
export class DriversComponent implements OnInit {
  drivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  isLoading = true;
  error = '';
  

  selectedSeason = new Date().getFullYear();
  searchTerm = '';
  availableYears: number[] = [];

  constructor(private f1Service: F1Service) {
    // Generate available years (from 2000 to current year)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
      this.availableYears.push(year);
    }
  }

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.error = '';

    if (this.selectedSeason === new Date().getFullYear()) {
      this.f1Service.getCurrentDrivers().subscribe({
        next: (data) => {
          this.drivers = data.MRData.DriverTable.Drivers;
          this.filterDrivers();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading drivers:', err);
          this.error = 'Unable to load drivers. Please try again later.';
          this.isLoading = false;
        }
      });
    } else {
      // For historical seasons, we need to get drivers who participated in that season
      this.f1Service.getSeasonSchedule(this.selectedSeason).subscribe({
        next: (scheduleData) => {
          if (scheduleData.MRData.RaceTable.Races.length > 0) {
            // Get the drivers from the first race of the season
            const firstRace = scheduleData.MRData.RaceTable.Races[0];
            const season = parseInt(firstRace.season, 10);
            const round = parseInt(firstRace.round, 10);
            
            this.f1Service.getRaceResults(season, round).subscribe({
              next: (resultsData) => {
                if (resultsData.MRData.RaceTable.Races.length > 0) {
                  const race = resultsData.MRData.RaceTable.Races[0];
                  
                  // Extract unique drivers from results
                  this.drivers = race.Results.map(result => result.Driver);
                  this.filterDrivers();
                } else {
                  this.drivers = [];
                  this.filteredDrivers = [];
                }
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Error loading historical drivers:', err);
                this.error = 'Unable to load historical drivers. Please try again later.';
                this.isLoading = false;
              }
            });
          } else {
            this.drivers = [];
            this.filteredDrivers = [];
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error loading race schedule:', err);
          this.error = 'Unable to load race schedule. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }

  filterDrivers(): void {
    if (!this.searchTerm) {
      this.filteredDrivers = [...this.drivers];
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    
    this.filteredDrivers = this.drivers.filter(driver => 
      driver.givenName.toLowerCase().includes(searchTermLower) ||
      driver.familyName.toLowerCase().includes(searchTermLower) ||
      driver.nationality.toLowerCase().includes(searchTermLower)
    );
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}