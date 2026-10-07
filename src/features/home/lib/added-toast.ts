import { toast } from 'sonner';

import { appRoutes } from '@/lib/routes/app-routes';

/**
 * "{peça} na sacola · Ver sacola" (MobileInicio.dc.html). Only below 980 px:
 * the desktop cards confirm with their own check mark.
 */
function toastAddedToBag(name: string, openBag: (href: string) => void) {
	if (!window.matchMedia('(max-width: 979px)').matches) {
		return;
	}
	toast.success(`${name} na sacola`, {
		duration: 2600,
		action: {
			label: 'Ver sacola',
			onClick: () => openBag(appRoutes.cart.index),
		},
	});
}

export { toastAddedToBag };
