import { CheckIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

/** The mockup's dark confirmation toast ("Dados salvos", "Endereço excluído"…). */
function notify(text: string) {
	toast(text, {
		icon: <CheckIcon size={16} weight="bold" className="text-[#5BC583]" />,
		className:
			'!rounded-[14px] !border-0 !bg-foreground !text-background !shadow-[0_20px_40px_-16px_rgba(24,24,27,.4)] !font-sans',
		duration: 2800,
	});
}

export { notify };
