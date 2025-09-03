"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

export const description = "A radial chart with text"

interface ChartRadialTextProps {
  data: Array<{ browser: string; visitors: number; fill: string }>
  title: string
  description: string
  config?: ChartConfig
  footerTitle?: string
  footerDescription?: string
  trendingPercentage?: number
  centerLabel?: string
  endAngle?: number
  maxHeight?: string
}

export function ChartRadialText({
  data,
  title,
  description,
  config = {
    visitors: {
      label: "Visitors",
    },
    safari: {
      label: "Safari",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig,
  footerTitle,
  footerDescription,
  trendingPercentage,
  centerLabel = "Visitors",
  endAngle = 250,
  maxHeight = "450px",
}: ChartRadialTextProps) {
  return (
    <Card className="flex flex-col gap-0">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className={`mx-auto aspect-square max-h-[${maxHeight}]`}
        >
          <RadialBarChart
            data={data}
            startAngle={0}
            endAngle={endAngle}
            innerRadius={120}
            outerRadius={170}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[126, 114]}
            />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {data[0]?.visitors?.toLocaleString() || "0"}{"%"}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      {(footerTitle || footerDescription || trendingPercentage !== undefined) && (
        <CardFooter className="flex-col gap-2 text-sm pt-0 pb-6">
          {(footerTitle || trendingPercentage !== undefined) && (
            <div className="flex items-center gap-2 leading-none font-medium">
              {footerTitle || `Trending up by ${trendingPercentage}% this month`}
              {trendingPercentage !== undefined && <TrendingUp className="h-4 w-4" />}
            </div>
          )}
          {footerDescription && (
            <div className="text-muted-foreground leading-none">
              {footerDescription}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
