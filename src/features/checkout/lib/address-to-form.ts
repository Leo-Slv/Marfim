import { brazilianStates, type BrazilianState } from './brazilian-states';
import { maskPostalCode } from './format-address';
import type { CustomerAddress } from '../model/address';
import type { AddressForm } from '../schemas/address-form.schema';

/** A saved address back into the form, for editing. */
function addressToForm(address: CustomerAddress): AddressForm {
	const state = brazilianStates.includes(address.state as BrazilianState)
		? (address.state as BrazilianState)
		: 'SP';
	return {
		label: address.label,
		recipientName: address.recipientName,
		postalCode: maskPostalCode(address.postalCode),
		street: address.street,
		number: address.number,
		complement: address.complement ?? '',
		neighborhood: address.neighborhood,
		city: address.city,
		state,
		makeDefault: false,
	};
}

export { addressToForm };
