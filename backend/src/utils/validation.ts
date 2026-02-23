import { z } from 'zod';

// Agent Schemas
export const AgentNameSchema = z
  .string()
  .min(3, 'Name must be at least 3 characters')
  .max(32, 'Name must be less than 32 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, underscores, and hyphens');

export const CategorySchema = z
  .string()
  .min(2, 'Category must be at least 2 characters')
  .max(20, 'Category must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Category can only contain letters, numbers, underscores, and hyphens');

export const RegisterAgentSchema = z.object({
  name: AgentNameSchema,
  category: CategorySchema,
});

// Shield/Protocol Schemas
export const EncryptionProtocolSchema = z.enum(['AES-256', 'RSA-2048', 'CHACHA20']);

export const ShieldConfigSchema = z.object({
  protocol: EncryptionProtocolSchema,
});

// Match Schemas
export const MatchStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export const MatchQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
  status: MatchStatusSchema.optional(),
  offset: z.coerce.number().min(0).default(0),
});

export const LeaderboardQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  category: CategorySchema.optional(),
});

// UUID validation
export const UUIDSchema = z.string().uuid('Invalid ID format');

// Pagination
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Type exports
export type RegisterAgentInput = z.infer<typeof RegisterAgentSchema>;
export type ShieldConfigInput = z.infer<typeof ShieldConfigSchema>;
export type MatchQueryInput = z.infer<typeof MatchQuerySchema>;
export type LeaderboardQueryInput = z.infer<typeof LeaderboardQuerySchema>;
