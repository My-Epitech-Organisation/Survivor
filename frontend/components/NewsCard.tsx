"use client";

import { NewsCardProps } from "@/types/news";
import {
  Trophy,
  Rocket,
  Handshake,
  CircleDollarSign,
  Newspaper,
  MapPin,
  Calendar,
} from "lucide-react";

function getCategoryIcon(cat: string) {
  const icons = {
    award: <Trophy className="w-4" />,
    launch: <Rocket className="w-4" />,
    partnership: <Handshake className="w-4" />,
    funding: <CircleDollarSign className="w-4" />,
    default: <Newspaper className="w-4" />,
  };
  return icons[cat.toLowerCase() as keyof typeof icons] || icons.default;
}

function getCategoryColor(cat: string) {
  const colors: Record<string, string> = {
    award: "app-orange-primary",
    launch: "app-red-primary",
    partnership: "app-green-primary",
    funding: "app-yellow-primary",
    default: "app-text-primary",
  };
  return colors[cat.toLowerCase()] || colors.default;
}

export default function NewsCard({ item }: NewsCardProps) {
  return (
    <>
      <div className="bg-app-surface rounded-lg shadow p-6 flex flex-col gap-6 hover:scale-105 transition-all cursor-pointer justify-between">
        <div className="flex justify-between">
          <div>
            <div
              className={`flex gap-1 text-${getCategoryColor(item.category)}`}
            >
              {getCategoryIcon(item.category)}
              {item.category}
            </div>
          </div>
        </div>

        <div className="h-full flex justify-start">
          <h1 className="font-medium text-lg">{item.title}</h1>
        </div>

        <span className="border-b" />

        <div className="flex justify-between">
          <div className="flex gap-1">
            <MapPin />
            {item.location}
          </div>

          <div className="flex gap-1">
            <Calendar />
            {item.news_date}
          </div>
        </div>
      </div>
    </>
  );
}
