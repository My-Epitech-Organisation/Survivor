// types/project.ts

import {Founder} from "@/types/founders"

export interface ProjectOverviewProps
{
  ProjectId?: number;
  ProjectName: string;
  ProjectDescription?: string;
  ProjectSector?: string;
  ProjectMaturity?: string;
  ProjectLocation?: string;
  ProjectNeeds?: string;
  ProjectStatus?: string;
}

export interface ProjectDetailsProps
{
  ProjectId?: number;
  ProjectName: string;
  ProjectDescription?: string;
  ProjectSector?: string;
  ProjectMaturity?: string;
  ProjectAdress?: string;
  ProjectLegalStatus?: string;
  ProjectCreatedAt: string;
  ProjectFounders?: Founder[];
  ProjectEmail: string;
  ProjectPhone: string;
  ProjectNeeds?: string;
  ProjectProgess?: string;
  ProjectStatus?: string;
  ProjectSocial?: string;
  ProjectWebsite?: string;
}
