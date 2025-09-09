export interface MinimalFounder {
  name: string;
  picture: string;
}

export interface Founder {
  FounderID: number;
  FounderName: string;
  FounderStartupID: number;
  FounderPictureURL: string;
}

export interface FounderResponse {
  id: number;
  name: string;
  FounderStartupID: number;
}
