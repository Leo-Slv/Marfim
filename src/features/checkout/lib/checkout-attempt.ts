/**
 * The idempotency key of the current checkout attempt, kept per tab in
 * sessionStorage. The same bag + addresses (`signature`) reuse the key, so
 * a reload, "Voltar" or a double click replays the same order instead of
 * creating another; anything different — or "Tentar de novo" after a
 * failure — starts a new attempt.
 */
type CheckoutAttempt = { key: string; signature: string };

const ATTEMPT_STORAGE_KEY = 'marfim.checkout.attempt';

type Lines = readonly { productId: string; quantity: number }[];

function attemptSignature(
	lines: Lines,
	shippingAddressId: string,
	billingAddressId: string,
) {
	const items = [...lines]
		.sort((a, b) => a.productId.localeCompare(b.productId))
		.map((line) => `${line.productId}x${line.quantity}`)
		.join(',');
	return `${items}|${shippingAddressId}|${billingAddressId}`;
}

/** The stored attempt if it matches `signature`, else a fresh one. */
function resolveAttempt(
	stored: CheckoutAttempt | null,
	signature: string,
	newKey: () => string,
): CheckoutAttempt {
	return stored?.signature === signature
		? stored
		: { key: newKey(), signature };
}

function readAttempt(): CheckoutAttempt | null {
	try {
		const raw = window.sessionStorage.getItem(ATTEMPT_STORAGE_KEY);
		const parsed: unknown = raw ? JSON.parse(raw) : null;
		if (
			parsed &&
			typeof parsed === 'object' &&
			typeof (parsed as CheckoutAttempt).key === 'string' &&
			typeof (parsed as CheckoutAttempt).signature === 'string'
		) {
			return parsed as CheckoutAttempt;
		}
	} catch {
		// Storage blocked or corrupt: a new attempt is fine.
	}
	return null;
}

function writeAttempt(attempt: CheckoutAttempt) {
	try {
		window.sessionStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(attempt));
	} catch {
		// Without storage a reload just starts a new attempt.
	}
}

function clearAttempt() {
	try {
		window.sessionStorage.removeItem(ATTEMPT_STORAGE_KEY);
	} catch {
		// Nothing to clear.
	}
}

/** The attempt to use for this bag + addresses, persisted. */
function checkoutAttemptFor(signature: string) {
	const attempt = resolveAttempt(readAttempt(), signature, () =>
		crypto.randomUUID(),
	);
	writeAttempt(attempt);
	return attempt;
}

/**
 * The stored attempt only if it is for exactly this bag + addresses — used
 * to replay an order after a reload without ever creating a new one.
 */
function existingAttemptFor(signature: string) {
	const stored = readAttempt();
	return stored?.signature === signature ? stored : null;
}

/** Whether this tab started a checkout that hasn't been cleared yet. */
function hasAttempt() {
	return readAttempt() !== null;
}

export type { CheckoutAttempt };
export {
	attemptSignature,
	checkoutAttemptFor,
	clearAttempt,
	existingAttemptFor,
	hasAttempt,
	resolveAttempt,
};
