import { Constructor } from './driver.model';

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface ConstructorStandingsResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    StandingsTable: {
      season: string;
      round: string;
      StandingsLists: {
        season: string;
        round: string;
        ConstructorStandings: ConstructorStanding[];
      }[];
    };
  };
}

export interface ConstructorsResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    ConstructorTable: {
      season?: string;
      Constructors: Constructor[];
    };
  };
}