'use client';

import { Dialog as DialogPrimitive } from 'radix-ui';

/**
 * Sheet sliding up from the bottom (the mobile mockups' sort options,
 * cancellation confirm…): Radix Dialog, so it traps focus and closes on
 * Esc or a tap on the overlay.
 */
function BottomSheet({
	open,
	onOpenChange,
	title,
	description,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: React.ReactNode;
	description?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-40 animate-fade-in bg-foreground/35" />
				<DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-41 flex max-h-[85vh] animate-sheet-up flex-col gap-3 overflow-y-auto rounded-t-[20px] bg-card px-4 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] outline-none">
					<span
						aria-hidden="true"
						className="h-1 w-10 shrink-0 self-center rounded-full bg-border"
					/>
					<DialogPrimitive.Title className="text-lg font-medium">
						{title}
					</DialogPrimitive.Title>
					{description ? (
						<DialogPrimitive.Description className="text-sm leading-normal text-ink-soft">
							{description}
						</DialogPrimitive.Description>
					) : (
						<DialogPrimitive.Description className="sr-only">
							{title}
						</DialogPrimitive.Description>
					)}
					{children}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

export { BottomSheet };
