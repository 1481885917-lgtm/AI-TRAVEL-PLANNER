import { z } from "zod";
import { preferenceOptions } from "@/lib/types";

export const plannerInputSchema = z
  .object({
    origin: z.string().min(1, "请输入起点"),
    destination: z.string().min(1, "请输入目的地"),
    viaCities: z.array(z.string()).default([]),
    departDate: z.string().min(1, "请选择出发日期"),
    returnDate: z.string().min(1, "请选择返回日期"),
    totalBudget: z.coerce.number().positive("预算必须大于 0"),
    travelers: z.coerce.number().int().positive("人数必须大于 0"),
    preferences: z.array(z.enum(preferenceOptions)).min(1, "至少选择一个偏好")
  })
  .refine((data) => new Date(data.returnDate) >= new Date(data.departDate), {
    message: "返回日期不能早于出发日期",
    path: ["returnDate"]
  });
