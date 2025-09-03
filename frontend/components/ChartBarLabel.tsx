"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartBarLabelProps {
  data: Array<{ month: string; views: number }>
  title: string
  description: string
  config?: ChartConfig
  footerTitle?: string
  footerDescription?: string
  trendingPercentage?: number
}

export function ChartBarLabel({
  data,
  title,
  description,
  config = {
    views: {
      label: "Views",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig,
  footerTitle,
  footerDescription,
  trendingPercentage,
}: ChartBarLabelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="py-16">
        <ChartContainer config={config}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="views" fill="var(--color-views)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
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
