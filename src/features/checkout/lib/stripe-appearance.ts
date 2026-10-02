import type { Appearance, StripeElementsOptions } from '@stripe/stripe-js';

/**
 * Stripe's Payment Element dressed in the Marfim tokens (globals.css), so
 * the card fields look like the rest of the form in Pagamento.dc.html.
 */
const stripeAppearance: Appearance = {
	theme: 'stripe',
	variables: {
		colorPrimary: '#3B3FD9',
		colorBackground: '#FFFFFF',
		colorText: '#18181B',
		colorTextSecondary: '#6B6B72',
		colorDanger: '#B4501E',
		fontFamily: 'Outfit, system-ui, sans-serif',
		fontSizeBase: '15px',
		borderRadius: '12px',
		spacingUnit: '4px',
	},
	rules: {
		'.Input': {
			border: '1px solid #E6E4DE',
			boxShadow: 'none',
			padding: '14px',
		},
		'.Input:focus': {
			border: '1px solid #3B3FD9',
			boxShadow: '0 0 0 1px #3B3FD9',
		},
		'.Label': { color: '#44444A', fontSize: '13px' },
	},
};

const stripeFonts: StripeElementsOptions['fonts'] = [
	{
		cssSrc:
			'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap',
	},
];

export { stripeAppearance, stripeFonts };
