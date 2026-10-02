import { z } from 'zod';

import { orderStatusSchema } from '@/features/checkout/schemas/order.schema';

import { isValidPhone } from '../lib/account-format';
import { isStrongPassword } from '@/features/auth/lib/password-strength';

/** Mirrors OrderCore's `CustomerResponse`. */
const profileSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	phone: z.string().nullable(),
});

/** Mirrors OrderCore's `OrderSummaryResponse`. */
const orderSummarySchema = z.object({
	id: z.string(),
	orderNumber: z.string(),
	status: orderStatusSchema,
	createdAt: z.string(),
	totalAmount: z.number(),
	currency: z.string(),
	itemCount: z.number(),
});

const orderSummaryPageSchema = z.object({
	items: z.array(orderSummarySchema),
	page: z.number(),
	pageSize: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

/** Mirrors OrderCore's `OrderStatusHistoryEntryResponse`. */
const statusHistorySchema = z.array(
	z.object({
		fromStatus: z.string().nullable(),
		toStatus: z.string(),
		reason: z.string().nullable(),
		changedAt: z.string(),
	}),
);

/** Shipment fields of `OrderResponse` (read only on the account pages). */
const orderShipmentSchema = z
	.object({
		carrier: z.string().nullable(),
		trackingCode: z.string().nullable(),
		trackingUrl: z.string().nullable(),
	})
	.nullable()
	.optional();

const profileFormSchema = z.object({
	first: z.string().trim().min(1, 'O nome é obrigatório.'),
	last: z.string().trim(),
	phone: z.string().refine(isValidPhone, {
		message: 'Use DDD + número, com 10 ou 11 dígitos.',
	}),
});

const changePasswordFormSchema = z.object({
	currentPassword: z.string().min(1, 'Digite a senha atual.'),
	newPassword: z.string().refine(isStrongPassword, {
		message:
			'A senha precisa ter de 8 a 128 caracteres, com pelo menos uma letra e um número.',
	}),
});

type Profile = z.infer<typeof profileSchema>;
type OrderSummary = z.infer<typeof orderSummarySchema>;
type OrderSummaryPage = z.infer<typeof orderSummaryPageSchema>;
type ProfileForm = z.infer<typeof profileFormSchema>;
type ChangePasswordForm = z.infer<typeof changePasswordFormSchema>;

export type {
	ChangePasswordForm,
	OrderSummary,
	OrderSummaryPage,
	Profile,
	ProfileForm,
};
export {
	changePasswordFormSchema,
	orderShipmentSchema,
	orderSummaryPageSchema,
	profileFormSchema,
	profileSchema,
	statusHistorySchema,
};
