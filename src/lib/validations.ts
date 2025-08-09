import { z } from 'zod';

export const surveySubmissionSchema = z.object({
  cycleId: z.string(),
  enpsScore: z.number().min(0).max(10),
  answers: z.array(z.string().optional()).max(3),
  name: z.string().optional(),
  departmentId: z.string().optional(),
  honeypot: z.string().optional(),
});

export const createCycleSchema = z.object({
  year: z.number().min(2020).max(2100),
  month: z.number().min(1).max(12),
  startsAt: z.string().transform((val) => new Date(val)),
  endsAt: z.string().transform((val) => new Date(val)),
  questions: z.array(z.object({
    order: z.number().min(1).max(3),
    text: z.string().min(1).max(500),
  })).min(1).max(3),
});

export const updateCycleSchema = z.object({
  isActive: z.boolean().optional(),
  endsAt: z.string().transform((val) => new Date(val)).optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
});

export const exportQuerySchema = z.object({
  cycle: z.string().optional(), // format: "YYYY-MM" or "all"
});
