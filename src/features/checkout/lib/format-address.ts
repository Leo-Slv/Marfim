import type { AddressForm } from '../schemas/address-form.schema';
import type { CustomerAddress, CustomerAddressRequest } from '../model/address';

/** Live CEP mask: digits only, "00000-000". */
function maskPostalCode(value: string) {
	const digits = value.replace(/\D/g, '').slice(0, 8);
	return digits.length > 5
		? `${digits.slice(0, 5)}-${digits.slice(5)}`
		: digits;
}

/** The two lines of an address card (Entrega.dc.html). */
function addressLines(address: CustomerAddress) {
	const streetLine = [
		`${address.street}, ${address.number}`,
		address.complement,
	]
		.filter(Boolean)
		.join(' · ');
	const placeLine = [
		address.neighborhood,
		`${address.city}, ${address.state}`,
		maskPostalCode(address.postalCode),
	]
		.filter(Boolean)
		.join(' · ');

	return { streetLine, placeLine };
}

/**
 * Form → OrderCore request. A blank label becomes "Endereço N" (required by
 * the backend, pendency #2); the country is always Brazil (pendency #3).
 */
function toAddressRequest(
	form: AddressForm,
	existingCount: number,
): CustomerAddressRequest {
	return {
		label: form.label.trim() || `Endereço ${existingCount + 1}`,
		recipientName: form.recipientName.trim(),
		phone: null,
		street: form.street.trim(),
		number: form.number.trim(),
		complement: form.complement.trim() || null,
		neighborhood: form.neighborhood.trim(),
		city: form.city.trim(),
		state: form.state,
		postalCode: maskPostalCode(form.postalCode),
		country: 'BR',
	};
}

export { addressLines, maskPostalCode, toAddressRequest };
