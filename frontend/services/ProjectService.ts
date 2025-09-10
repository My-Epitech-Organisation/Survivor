import { api, authenticatedFetch } from "../lib/api";
import { ProjectDetailsProps } from "@/types/project";

export interface MostLikedProject extends ProjectDetailsProps {
  likes_count?: number;
}

export const ProjectService = {
  getMostLikedProjects: async (
    nbProjects: number
  ): Promise<MostLikedProject[]> => {
    try {
      const response = await authenticatedFetch(`/projects/most-liked-projects/${nbProjects}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: MostLikedProject[] = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error fetching most liked projects:", error);
      return [];
    }
  },
};
