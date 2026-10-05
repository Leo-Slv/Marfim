import { z } from 'zod';

const stockLevelSchema = z.object({
	quantityOnHand: z.number(),
	quantityReserved: z.number(),
	quantityAvailable: z.number(),
	reorderLevel: z.number(),
	state: z.string(),
});

/** A row of `GET /api/admin/catalog/products`: product + its stock. */
const stockRowSchema = z.object({
	id: z.string(),
	sku: z.string(),
	slug: z.string(),
	name: z.string(),
	stock: stockLevelSchema.nullable(),
});

const stockRowsSchema = z.object({
	items: z.array(stockRowSchema),
	page: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

/** OrderCore's `StockItemResponse`. */
const stockItemSchema = stockLevelSchema.extend({
	productId: z.string(),
	updatedAt: z.string(),
});

/** OrderCore's `StockMovementResponse`. */
const stockMovementSchema = z.object({
	id: z.string(),
	movementType: z.string(),
	quantity: z.number(),
	reason: z.string().nullable(),
	createdAt: z.string(),
});

const stockMovementPageSchema = z.object({
	items: z.array(stockMovementSchema),
	page: z.number(),
	totalPages: z.number(),
});

/** OrderCore's `ReservationResponse`. */
const reservationSchema = z.object({
	id: z.string(),
	orderId: z.string(),
	quantity: z.number(),
	status: z.string(),
	reservedAt: z.string(),
});

const reservationPageSchema = z.object({
	items: z.array(reservationSchema),
	totalPages: z.number(),
});

type StockLevel = z.infer<typeof stockLevelSchema>;
type StockRow = z.infer<typeof stockRowSchema>;
type StockItem = z.infer<typeof stockItemSchema>;
type StockMovement = z.infer<typeof stockMovementSchema>;
type Reservation = z.infer<typeof reservationSchema>;

export type { Reservation, StockItem, StockLevel, StockMovement, StockRow };
export {
	reservationPageSchema,
	stockItemSchema,
	stockMovementPageSchema,
	stockRowsSchema,
};
