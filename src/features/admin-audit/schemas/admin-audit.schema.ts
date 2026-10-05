import { z } from 'zod';

/** OrderCore's `AuditLogResponse`. */
const auditLogSchema = z.object({
	id: z.string(),
	userId: z.string().nullable(),
	action: z.string(),
	entityName: z.string(),
	entityId: z.string().nullable(),
	metadata: z.record(z.string(), z.string().nullable()),
	createdAt: z.string(),
});

const auditLogPageSchema = z.object({
	items: z.array(auditLogSchema),
	page: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

type AuditLog = z.infer<typeof auditLogSchema>;

export type { AuditLog };
export { auditLogPageSchema, auditLogSchema };
