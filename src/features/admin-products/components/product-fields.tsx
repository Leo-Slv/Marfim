import { forwardRef, type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const controlClass =
	'w-full rounded-[10px] border bg-card px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-clay disabled:bg-surface disabled:text-muted-foreground';

type FieldProps = {
	id: string;
	label: string;
	error?: string;
	hint?: string;
};

/** Label + input + error, the admin editor's field. */
const TextInput = forwardRef<
	HTMLInputElement,
	ComponentProps<'input'> & FieldProps
>(function TextInput({ id, label, error, hint, className, ...props }, ref) {
	return (
		<div className="flex flex-col gap-[5px] text-xs text-ink-soft">
			<label htmlFor={id}>{label}</label>
			<input
				ref={ref}
				id={id}
				aria-invalid={error ? true : undefined}
				aria-describedby={error || hint ? `${id}-help` : undefined}
				className={cn(controlClass, 'h-10', className)}
				{...props}
			/>
			{error || hint ? (
				<span
					id={`${id}-help`}
					className={error ? 'text-clay' : 'text-muted-foreground'}
				>
					{error ?? hint}
				</span>
			) : null}
		</div>
	);
});

const TextArea = forwardRef<
	HTMLTextAreaElement,
	ComponentProps<'textarea'> & FieldProps
>(function TextArea({ id, label, error, hint, className, ...props }, ref) {
	return (
		<div className="flex flex-col gap-[5px] text-xs text-ink-soft">
			<label htmlFor={id}>{label}</label>
			<textarea
				ref={ref}
				id={id}
				aria-invalid={error ? true : undefined}
				className={cn(
					controlClass,
					'resize-none py-2.5 leading-normal',
					className,
				)}
				{...props}
			/>
			{error || hint ? (
				<span className={error ? 'text-clay' : 'text-muted-foreground'}>
					{error ?? hint}
				</span>
			) : null}
		</div>
	);
});

const SelectInput = forwardRef<
	HTMLSelectElement,
	ComponentProps<'select'> & FieldProps
>(function SelectInput(
	{ id, label, error, hint, className, children, ...props },
	ref,
) {
	return (
		<div className="flex flex-col gap-[5px] text-xs text-ink-soft">
			<label htmlFor={id}>{label}</label>
			<select
				ref={ref}
				id={id}
				aria-invalid={error ? true : undefined}
				className={cn(controlClass, 'h-10 px-2', className)}
				{...props}
			>
				{children}
			</select>
			{error || hint ? (
				<span className={error ? 'text-clay' : 'text-muted-foreground'}>
					{error ?? hint}
				</span>
			) : null}
		</div>
	);
});

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
			{children}
		</span>
	);
}

export { SectionLabel, SelectInput, TextArea, TextInput };
