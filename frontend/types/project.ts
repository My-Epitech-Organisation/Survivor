// types/project.ts

import { Founder } from "@/types/founders";

export interface ProjectFiltersProps {
  ProjectSector: string[];
  ProjectMaturity: string[];
  ProjectLocation: string[];
  onFiltersChange?: (filters: {
    locations: string[];
    maturities: string[];
    sectors: string[];
  }) => void;
}

export interface ProjectOverviewProps {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription?: string;
  ProjectSector: string;
  ProjectMaturity: string;
  ProjectLocation: string;
  ProjectNeeds: string;
  ProjectStatus: string;
}

export interface ProjectDetailsProps {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectSector: string;
  ProjectMaturity: string;
  ProjectAddress: string;
  ProjectLegalStatus: string;
  ProjectCreatedAt: string;
  ProjectFounders: Founder[];
  ProjectEmail: string;
  ProjectPhone: string;
  ProjectNeeds: string;
  ProjectStatus: string;
  ProjectSocial: string;
  ProjectWebsite: string;
}

export interface FormProjectDetails {
  ProjectId?: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectSector: string;
  ProjectMaturity: string;
  ProjectAddress: string;
  ProjectLegalStatus: string;
  ProjectCreatedAt: string;
  ProjectFounders: Founder[];
  ProjectEmail: string;
  ProjectPhone: string;
  ProjectNeeds: string;
  ProjectStatus: string;
  ProjectSocial: string;
  ProjectWebsite: string;
}
