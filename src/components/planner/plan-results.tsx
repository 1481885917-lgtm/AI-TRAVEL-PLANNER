"use client";

import { CalendarDays, CloudSun, Hotel, MapPinned, Plane, Utensils, Wallet, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfExportButton } from "@/components/planner/pdf-export-button";
import { RouteMap } from "@/components/planner/route-map";
import type { TravelPlan } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type PlanResultsProps = {
  plan: TravelPlan;
  onReset: () => void;
};

export function PlanResults({ plan, onReset }: PlanResultsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">旅行方案</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.input.origin} 到 {plan.input.destination}，{plan.input.travelers} 人出行
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onReset}>
            重新规划
          </Button>
          <PdfExportButton plan={plan} />
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={Wallet} label="总预算估算" value={formatCurrency(plan.budget.total)} />
        <Metric icon={Plane} label="跨城交通" value={formatCurrency(plan.budget.transport)} />
        <Metric icon={Hotel} label="酒店预算" value={formatCurrency(plan.budget.hotels)} />
        <Metric icon={CalendarDays} label="人均预算" value={formatCurrency(plan.budget.perPerson)} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="h-5 w-5" />
            路线地图
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RouteMap route={plan.route} />
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.route.map((stop) => (
              <Badge key={stop.city}>{stop.city}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          {plan.days.map((day) => (
            <Card key={`${day.day}-${day.city}`}>
              <CardHeader>
                <CardTitle>
                  Day {day.day} · {day.date} · {day.city}
                </CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge>{day.title}</Badge>
                  {day.weather ? (
                    <Badge>
                      {day.weather.condition} {day.weather.temperatureMin}-{day.weather.temperatureMax}℃
                    </Badge>
                  ) : null}
                  <Badge>{formatCurrency(day.estimatedBudget)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Timeline label="上午" value={day.morning} />
                <Timeline label="下午" value={day.afternoon} />
                <Timeline label="晚上" value={day.evening} />
                <div className="rounded-md bg-muted p-3 text-sm">{day.cityTransport}</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoList
                    title="景点"
                    items={day.attractions.map((item) => ({
                      label: `${item.name} · ${item.rating}分 · ${formatCurrency(item.ticketPrice)}`,
                      source: item.source
                    }))}
                  />
                  <InfoList
                    title="美食"
                    items={day.food.map((item) => ({
                      label: `${item.name} · ${item.signatureDish} · 人均${formatCurrency(item.averageCost)}`,
                      source: item.source
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                城市间交通
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.transports.map((item) => (
                <div key={`${item.from}-${item.to}`} className="rounded-md border p-3 text-sm">
                  <div className="font-medium">
                    {item.from} → {item.to}
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    {item.mode} · {item.duration} · {formatCurrency(item.price)}/人
                  </div>
                  <div className="mt-2">{item.reason}</div>
                  {item.source ? (
                    <a className="mt-2 block text-primary" href={item.source} target="_blank" rel="noreferrer">
                      查看来源
                    </a>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                酒店推荐
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.hotels.slice(0, 6).map((item) => (
                <div key={`${item.city}-${item.name}`} className="text-sm">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground">
                    {item.city} · {item.rating}分 · {formatCurrency(item.pricePerNight)}/晚 · 距中心 {item.distanceToCenterKm}km
                  </div>
                  {item.source ? (
                    <a className="text-primary" href={item.source} target="_blank" rel="noreferrer">
                      查看来源
                    </a>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="h-5 w-5" />
                天气预报
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {plan.weather.slice(0, 8).map((item) => (
                <div key={`${item.city}-${item.date}`} className="flex justify-between gap-3 text-sm">
                  <span>{item.city} {item.date}</span>
                  <span className="text-muted-foreground">{item.condition} {item.temperatureMin}-{item.temperatureMax}℃</span>
                  {item.source ? (
                    <a className="text-primary" href={item.source} target="_blank" rel="noreferrer">
                      来源
                    </a>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                注意事项
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.notices.map((notice) => (
                  <li key={notice}>{notice}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Timeline({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[48px_1fr] gap-3 text-sm">
      <div className="font-medium text-primary">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: Array<{ label: string; source?: string }> }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{title}</div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.label}>
            {item.label}
            {item.source ? (
              <a className="ml-2 text-primary" href={item.source} target="_blank" rel="noreferrer">
                来源
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
