"use client";

import { Loader2, Route, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import { PlanResults } from "@/components/planner/plan-results";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { preferenceOptions, type Preference, type TravelPlan } from "@/lib/types";
import { splitCities } from "@/lib/utils";

type FormState = {
  origin: string;
  destination: string;
  viaCities: string;
  departDate: string;
  returnDate: string;
  totalBudget: string;
  travelers: string;
  preferences: Preference[];
};

const defaultState: FormState = {
  origin: "上海",
  destination: "成都",
  viaCities: "杭州",
  departDate: "2026-07-10",
  returnDate: "2026-07-15",
  totalBudget: "18000",
  travelers: "2",
  preferences: ["美食", "自然风光", "历史文化"]
};

export default function Home() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: form.origin,
          destination: form.destination,
          viaCities: splitCities(form.viaCities),
          departDate: form.departDate,
          returnDate: form.returnDate,
          totalBudget: Number(form.totalBudget),
          travelers: Number(form.travelers),
          preferences: form.preferences
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "行程生成失败，请检查输入。");
      }

      setPlan(data as TravelPlan);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "行程生成失败");
    } finally {
      setIsLoading(false);
    }
  }

  function togglePreference(preference: Preference) {
    setForm((current) => ({
      ...current,
      preferences: current.preferences.includes(preference)
        ? current.preferences.filter((item) => item !== preference)
        : [...current.preferences, preference]
    }));
  }

  return (
    <main className="min-h-screen">
      <section className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
              <Route className="h-4 w-4" />
              Multi-Agent AI Travel Planner
            </div>
            <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">AI Travel Planner</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              输入出发地、目的地、日期、预算和偏好，系统通过 Transport、Weather、Attraction、Hotel、Food、Budget 和 Schedule Optimizer Agent 自动生成可导出的完整旅行方案。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm md:w-80">
            {["LangGraph", "OpenAI API", "Supabase", "Mapbox"].map((item) => (
              <Badge key={item} className="justify-center bg-muted">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-6">
        {plan ? (
          <PlanResults plan={plan} onReset={() => setPlan(null)} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>规划参数</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={submit}>
                  <Field label="起点">
                    <Input value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} />
                  </Field>
                  <Field label="目的地">
                    <Input value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} />
                  </Field>
                  <Field label="途径城市">
                    <Input
                      placeholder="用逗号分隔，可留空"
                      value={form.viaCities}
                      onChange={(event) => setForm({ ...form, viaCities: event.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="出发日期">
                      <Input type="date" value={form.departDate} onChange={(event) => setForm({ ...form, departDate: event.target.value })} />
                    </Field>
                    <Field label="返回日期">
                      <Input type="date" value={form.returnDate} onChange={(event) => setForm({ ...form, returnDate: event.target.value })} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="总预算">
                      <Input type="number" min="1" value={form.totalBudget} onChange={(event) => setForm({ ...form, totalBudget: event.target.value })} />
                    </Field>
                    <Field label="出行人数">
                      <Input type="number" min="1" value={form.travelers} onChange={(event) => setForm({ ...form, travelers: event.target.value })} />
                    </Field>
                  </div>
                  <div>
                    <Label>行程偏好</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {preferenceOptions.map((preference) => {
                        const active = form.preferences.includes(preference);
                        return (
                          <button
                            key={preference}
                            type="button"
                            onClick={() => togglePreference(preference)}
                            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                              active ? "border-primary bg-primary text-primary-foreground" : "bg-white hover:bg-muted"
                            }`}
                          >
                            {preference}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {error ? <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    生成 AI 行程
                  </Button>
                </form>
              </CardContent>
            </Card>

            <section className="grid gap-4 md:grid-cols-2">
              {[
                ["Transport Agent", "比较飞机、高铁、火车等跨城方案，输出价格、耗时、推荐原因。"],
                ["Weather Agent", "按城市和日期拉取天气预报，影响每日室内外安排。"],
                ["Attraction Agent", "结合偏好筛选景点，保留评分、门票、开放时间和坐标。"],
                ["Hotel Agent", "根据预算和位置推荐酒店，输出价格、评分和距离。"],
                ["Food Agent", "推荐特色菜、本地餐厅和人均消费。"],
                ["Budget Agent", "汇总交通、住宿、门票、餐饮、市内交通和缓冲预算。"],
                ["Schedule Optimizer Agent", "使用 OpenAI 优化每日节奏，生成可执行行程。"]
              ].map(([title, body]) => (
                <Card key={title}>
                  <CardHeader>
                    <CardTitle>{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-muted-foreground">{body}</CardContent>
                </Card>
              ))}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
