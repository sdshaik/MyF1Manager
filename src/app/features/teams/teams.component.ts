import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { F1Service } from '@core/services/f1.service';
import { Constructor } from '@core/models/driver.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss'
})
export class TeamsComponent implements OnInit {
  constructors: Constructor[] = [];
  filteredConstructors: Constructor[] = [];
  isLoading = true;
  error = '';
  
  // Filter options
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
    this.loadConstructors();
  }

  loadConstructors(): void {
    this.isLoading = true;
    this.error = '';

    if (this.selectedSeason === new Date().getFullYear()) {
      this.f1Service.getCurrentConstructors().subscribe({
        next: (data) => {
          this.constructors = data.MRData.ConstructorTable.Constructors;
          this.filterConstructors();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading constructors:', err);
          this.error = 'Unable to load teams. Please try again later.';
          this.isLoading = false;
        }
      });
    } else {
      // For historical seasons, get constructors from constructor standings
      this.f1Service.getConstructorStandings(this.selectedSeason).subscribe({
        next: (data) => {
          if (data.MRData.StandingsTable.StandingsLists.length > 0) {
            this.constructors = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.map(
              standing => standing.Constructor
            );
            this.filterConstructors();
          } else {
            this.constructors = [];
            this.filteredConstructors = [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading historical constructors:', err);
          this.error = 'Unable to load historical teams. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }

  filterConstructors(): void {
    if (!this.searchTerm) {
      this.filteredConstructors = [...this.constructors];
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    
    this.filteredConstructors = this.constructors.filter(constructor => 
      constructor.name.toLowerCase().includes(searchTermLower) ||
      constructor.nationality.toLowerCase().includes(searchTermLower)
    );
  }
}