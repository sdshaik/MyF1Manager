import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RaceSchedule } from '../models/race.model';
import { DriversResponse, DriverStandingsResponse } from '../models/driver.model';
import { ConstructorsResponse, ConstructorStandingsResponse } from '../models/constructor.model';
import { RaceResultsResponse } from '../models/result.model';

@Injectable({
  providedIn: 'root'
})
export class F1Service {
  private baseUrl = 'https://ergast.com/api/f1';
  private jsonSuffix = '.json';

  constructor(private http: HttpClient) { }

  getCurrentSeasonSchedule(): Observable<RaceSchedule> {
    return this.http.get<RaceSchedule>(`${this.baseUrl}/current${this.jsonSuffix}`);
  }

  getSeasonSchedule(season: number): Observable<RaceSchedule> {
    return this.http.get<RaceSchedule>(`${this.baseUrl}/${season}${this.jsonSuffix}`);
  }

  getCurrentDrivers(): Observable<DriversResponse> {
    return this.http.get<DriversResponse>(`${this.baseUrl}/current/drivers${this.jsonSuffix}`);
  }

  getDriversBySeasonAndConstructor(season: number, constructorId: string): Observable<DriversResponse> {
    return this.http.get<DriversResponse>(
      `${this.baseUrl}/${season}/constructors/${constructorId}/drivers${this.jsonSuffix}`
    );
  }

  getDriverDetails(driverId: string): Observable<DriversResponse> {
    return this.http.get<DriversResponse>(`${this.baseUrl}/drivers/${driverId}${this.jsonSuffix}`);
  }

  getCurrentConstructors(): Observable<ConstructorsResponse> {
    return this.http.get<ConstructorsResponse>(`${this.baseUrl}/current/constructors${this.jsonSuffix}`);
  }

  getConstructorDetails(constructorId: string): Observable<ConstructorsResponse> {
    return this.http.get<ConstructorsResponse>(`${this.baseUrl}/constructors/${constructorId}${this.jsonSuffix}`);
  }

  getCurrentRaceResults(round: number): Observable<RaceResultsResponse> {
    return this.http.get<RaceResultsResponse>(`${this.baseUrl}/current/${round}/results${this.jsonSuffix}`);
  }

  getRaceResults(season: number, round: number): Observable<RaceResultsResponse> {
    return this.http.get<RaceResultsResponse>(`${this.baseUrl}/${season}/${round}/results${this.jsonSuffix}`);
  }

  getCurrentDriverStandings(): Observable<DriverStandingsResponse> {
    return this.http.get<DriverStandingsResponse>(`${this.baseUrl}/current/driverStandings${this.jsonSuffix}`);
  }

  getDriverStandings(season: number): Observable<DriverStandingsResponse> {
    return this.http.get<DriverStandingsResponse>(`${this.baseUrl}/${season}/driverStandings${this.jsonSuffix}`);
  }

  getCurrentConstructorStandings(): Observable<ConstructorStandingsResponse> {
    return this.http.get<ConstructorStandingsResponse>(`${this.baseUrl}/current/constructorStandings${this.jsonSuffix}`);
  }

  getConstructorStandings(season: number): Observable<ConstructorStandingsResponse> {
    return this.http.get<ConstructorStandingsResponse>(`${this.baseUrl}/${season}/constructorStandings${this.jsonSuffix}`);
  }

  // Helper method to get current season number
  getCurrentSeason(): number {
    //return new Date().getFullYear();
    return 2024;
  }
}