import { appRoutes } from '@/lib/routes/app-routes';

import type { AuditLog } from '../schemas/admin-audit.schema';

type EntityTab = { id: string; label: string; entityName: string | null };

/** Entity tabs; OrderCore doesn't audit categories (pendency #4). */
const entityTabs: EntityTab[] = [
	{ id: 'todos', label: 'Todos', entityName: null },
	{ id: 'pedido', label: 'Pedido', entityName: 'Order' },
	{ id: 'produto', label: 'Produto', entityName: 'Product' },
	{ id: 'estoque', label: 'Estoque', entityName: 'InventoryReservation' },
	{ id: 'cliente', label: 'Cliente', entityName: 'Customer' },
	{ id: 'pagamento', label: 'Pagamento', entityName: 'Payment' },
	{ id: 'conta', label: 'Conta', entityName: 'UserAccount' },
];

function parseEntityTab(value: string | null) {
	return entityTabs.find((tab) => tab.id === value) ?? entityTabs[0];
}

const entityLabels: Record<string, string> = {
	Order: 'Pedido',
	Product: 'Produto',
	InventoryReservation: 'Estoque',
	Customer: 'Cliente',
	Payment: 'Pagamento',
	UserAccount: 'Conta',
	FailedMessage: 'Mensagem',
};

function entityLabel(entityName: string) {
	return entityLabels[entityName] ?? entityName;
}

/** pt-BR for every `AuditLogActionNames` entry. */
const actionLabels: Record<string, string> = {
	OrderCreated: 'Criou o pedido',
	OrderConfirmed: 'Confirmou o pedido',
	OrderCancelled: 'Cancelou o pedido',
	OrderPaymentFailed: 'Pedido sem pagamento aprovado',
	OrderProcessingStarted: 'Iniciou o preparo',
	OrderShipped: 'Marcou como enviado',
	OrderDelivered: 'Marcou como entregue',
	OrderInternalNotesChanged: 'Alterou as notas internas',
	PaymentAuthorized: 'Pagamento autorizado',
	PaymentCaptured: 'Capturou o pagamento',
	PaymentFailed: 'Pagamento falhou',
	PaymentRefunded: 'Estornou pagamento',
	PaymentVoided: 'Liberou a autorização do cartão',
	PaymentDeclined: 'Pagamento recusado',
	PaymentAuthorizationExpired: 'Autorização do cartão expirou',
	PaymentDisputed: 'Contestação aberta no banco',
	PaymentRefundSettled: 'Estorno concluído no Stripe',
	PaymentReconciled: 'Conferiu o pagamento com o Stripe',
	InventoryReserved: 'Reservou estoque',
	InventoryReleased: 'Liberou reserva de estoque',
	InventoryConsumed: 'Baixou estoque (venda)',
	InventoryExpired: 'Reserva de estoque expirou',
	ProductCreated: 'Criou o produto',
	ProductPriceChanged: 'Alterou o preço',
	ProductPublished: 'Publicou o produto',
	ProductPromotionChanged: 'Alterou o preço “de”',
	ProductDiscontinued: 'Descontinuou o produto',
	CustomerCreated: 'Cadastro de cliente',
	CustomerDeactivated: 'Desativou conta',
	CustomerReactivated: 'Reativou conta',
	UserAccountCreated: 'Criou a conta de acesso',
	RefreshTokenReuseDetected: 'Reuso de sessão detectado',
	AccountLockedOut: 'Conta bloqueada por tentativas',
	PasswordResetRequested: 'Pediu redefinição de senha',
	PasswordReset: 'Redefiniu a senha',
	PasswordChanged: 'Trocou a senha',
	EmailConfirmed: 'Confirmou o e-mail',
	FailedMessageReplayed: 'Reenviou mensagem com falha',
	FailedMessageDiscarded: 'Descartou mensagem com falha',
};

function actionLabel(action: string) {
	return actionLabels[action] ?? action;
}

const metadataLabels: Record<string, string> = {
	newPrice: 'Novo preço',
	compareAtPrice: 'Preço “de”',
	sku: 'SKU',
	totalAmount: 'Total',
	amount: 'Valor',
	customerId: 'Cliente',
	orderId: 'Pedido',
	productId: 'Produto',
	quantity: 'Quantidade',
	reason: 'Motivo',
	cancelledBy: 'Cancelado por',
	payment: 'Pagamento',
	returnedUnits: 'Unidades devolvidas',
	source: 'Origem',
	role: 'Papel',
	email: 'E-mail',
};

/** "Detalhes": the event's data with pt-BR labels, recorded values as-is. */
function auditDetails(log: AuditLog) {
	return Object.entries(log.metadata)
		.filter(([, value]) => value !== null && value !== '')
		.map(([key, value]) => ({
			key,
			label: metadataLabels[key] ?? key,
			value: value ?? '',
		}));
}

type AuditLink = { label: string; href: string };

/** Where to open the record (and related ones) in the admin. */
function auditLinks(log: AuditLog): AuditLink[] {
	const links: AuditLink[] = [];
	const add = (label: string, href: string) => {
		if (!links.some((link) => link.href === href)) {
			links.push({ label, href });
		}
	};
	const id = log.entityId;
	if (id) {
		if (log.entityName === 'Order')
			add('Abrir pedido', appRoutes.admin.order(id));
		if (log.entityName === 'Product')
			add('Abrir produto', appRoutes.admin.product(id));
		if (log.entityName === 'Customer')
			add('Abrir cliente', appRoutes.admin.customer(id));
		if (log.entityName === 'Payment')
			add('Abrir pagamento', appRoutes.admin.payment(id));
	}
	const { orderId, productId, customerId } = log.metadata;
	if (orderId) add('Abrir pedido', appRoutes.admin.order(orderId));
	if (productId)
		add('Ver estoque do produto', appRoutes.admin.stockOf(productId));
	if (customerId) add('Abrir cliente', appRoutes.admin.customer(customerId));
	return links;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
	return UUID.test(value.trim());
}

/** "88fa15b6" — the first block of a UUID. */
function shortId(id: string | null) {
	return id ? id.split('-')[0] : '—';
}

type ActorKind = 'admin' | 'customer' | 'system';
type Actor = { name: string; kind: ActorKind };

/** QUEM, from what is known about the user. */
function actorOf(
	userId: string | null,
	currentUserId: string | null,
	resolved: { role: string | null; customerName: string | null } | undefined,
): Actor {
	if (!userId) {
		return { name: 'Sistema', kind: 'system' };
	}
	if (userId === currentUserId) {
		return { name: 'Você', kind: 'admin' };
	}
	if (resolved?.customerName) {
		return { name: resolved.customerName, kind: 'customer' };
	}
	if (resolved?.role === 'Customer') {
		return { name: 'Cliente', kind: 'customer' };
	}
	if (resolved) {
		return { name: 'Administrador', kind: 'admin' };
	}
	return { name: `Usuário ${shortId(userId)}`, kind: 'admin' };
}

export type { Actor, ActorKind, AuditLink, EntityTab };
export {
	actionLabel,
	actorOf,
	auditDetails,
	auditLinks,
	entityLabel,
	entityTabs,
	isUuid,
	parseEntityTab,
	shortId,
};
