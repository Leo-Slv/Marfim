'use client';

import {
	CheckIcon,
	DotOutlineIcon,
	EnvelopeSimpleIcon,
	EyeIcon,
	EyeSlashIcon,
	ClockCountdownIcon,
	WarningCircleIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { forwardRef, useState, type ComponentProps } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { cn } from '@/lib/utils';

import { passwordRules, passwordScore } from '../lib/password-strength';

/** The form column; remounts (and fades up) when `screenKey` changes. */
function AuthScreen({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex w-full max-w-[480px] animate-up flex-col gap-[22px] [animation-duration:.6s]">
			{children}
		</div>
	);
}

function AuthHeading({
	eyebrow,
	children,
	description,
}: {
	eyebrow?: string;
	children: React.ReactNode;
	description?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2">
			{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
			<h1 className="text-[32px] leading-[1.08] font-light tracking-[-0.03em] min-[980px]:text-[40px] min-[980px]:leading-[1.05]">
				{children}
			</h1>
			{description ? (
				<p className="text-[15px] leading-[1.6] text-ink-soft">{description}</p>
			) : null}
		</div>
	);
}

/** Highlight inside a heading ("de novo", "um minuto"). */
function Accent({ children }: { children: React.ReactNode }) {
	return <span className="font-medium text-primary">{children}</span>;
}

const inputClassName =
	'h-12 w-full rounded-xl border bg-card px-3.5 text-[15px] text-foreground transition-colors hover:border-[#C9C7C0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-clay';

type TextFieldProps = ComponentProps<'input'> & {
	label: React.ReactNode;
	error?: string;
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
	function TextField({ label, error, id, className, ...props }, ref) {
		const errorId = error && id ? `${id}-error` : undefined;
		return (
			<div className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
				<label htmlFor={id}>{label}</label>
				<input
					ref={ref}
					id={id}
					aria-invalid={error ? true : undefined}
					aria-describedby={errorId}
					className={cn(inputClassName, className)}
					{...props}
				/>
				{error ? (
					<span id={errorId} className="text-xs text-clay">
						{error}
					</span>
				) : null}
			</div>
		);
	},
);

type PasswordFieldProps = Omit<TextFieldProps, 'type'> & {
	/** Extra content on the label row (e.g. "Esqueci minha senha"). */
	labelAction?: React.ReactNode;
};

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
	function PasswordField({ label, labelAction, error, id, ...props }, ref) {
		const [visible, setVisible] = useState(false);
		const errorId = error && id ? `${id}-error` : undefined;

		return (
			<div className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
				<div className="flex items-center justify-between">
					<label htmlFor={id}>{label}</label>
					{labelAction}
				</div>
				<div className="relative flex">
					<input
						ref={ref}
						id={id}
						type={visible ? 'text' : 'password'}
						aria-invalid={error ? true : undefined}
						aria-describedby={errorId}
						className={cn(inputClassName, 'pr-[52px]')}
						{...props}
					/>
					<button
						type="button"
						onClick={() => setVisible((current) => !current)}
						aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
						className="absolute top-0.5 right-0.5 flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
					>
						{visible ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
					</button>
				</div>
				{error ? (
					<span id={errorId} className="text-xs text-clay">
						{error}
					</span>
				) : null}
			</div>
		);
	},
);

/** 3 bars + the backend's rules, live as the shopper types. */
function PasswordStrengthMeter({ password }: { password: string }) {
	const score = passwordScore(password);
	const barColor =
		score === 3 ? 'bg-success' : score === 2 ? 'bg-warning' : 'bg-clay';

	return (
		<div className="flex flex-col gap-2.5" aria-live="polite">
			<div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
				{[0, 1, 2].map((index) => (
					<span
						key={index}
						className={cn(
							'h-1 rounded-full transition-colors duration-300',
							index < score ? barColor : 'bg-border',
						)}
					/>
				))}
			</div>
			<ul className="flex flex-wrap gap-4 text-xs">
				{passwordRules(password).map((rule) => (
					<li
						key={rule.label}
						className={cn(
							'flex items-center gap-1.5',
							rule.ok ? 'text-success' : 'text-muted-foreground',
						)}
					>
						{rule.ok ? (
							<CheckIcon size={12} weight="bold" />
						) : (
							<DotOutlineIcon size={12} weight="fill" />
						)}
						<span>
							{rule.label}
							<span className="sr-only">
								{rule.ok ? ' — ok' : ' — pendente'}
							</span>
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

/** Error banner; give it a new `key` per error so the shake replays. */
function FormAlert({
	children,
	action,
}: {
	children: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<div
			role="alert"
			className="flex animate-shake items-start gap-2.5 rounded-xl bg-clay-soft px-4 py-3.5 text-sm leading-normal text-foreground"
		>
			<WarningCircleIcon size={18} className="mt-px shrink-0 text-clay" />
			<span className="grow">{children}</span>
			{action}
		</div>
	);
}

/** Neutral or success notice (link sent, already confirmed…). */
function StatusNotice({
	tone,
	children,
}: {
	tone: 'success' | 'info' | 'warning';
	children: React.ReactNode;
}) {
	return (
		<div
			role={tone === 'warning' ? 'alert' : 'status'}
			className={cn(
				'flex animate-up items-center gap-2.5 rounded-xl px-4 py-3 text-sm leading-normal',
				tone === 'success' && 'bg-success-soft text-success',
				tone === 'info' && 'bg-primary-soft text-foreground',
				tone === 'warning' && 'bg-clay-soft text-foreground',
			)}
		>
			{children}
		</div>
	);
}

/** Round icon that pops in: success check (drawn), expired clock or mail. */
function StatusIcon({ tone }: { tone: 'success' | 'expired' | 'mail' }) {
	if (tone === 'mail') {
		return (
			<div className="flex size-[72px] animate-fly items-center justify-center rounded-[20px] bg-primary-soft">
				<EnvelopeSimpleIcon size={34} className="text-primary" />
			</div>
		);
	}
	return (
		<span
			className={cn(
				'flex size-[72px] animate-pop-in items-center justify-center rounded-full',
				tone === 'success' ? 'bg-success-soft' : 'bg-clay-soft',
			)}
		>
			{tone === 'success' ? (
				<svg
					className="check-draw"
					width="34"
					height="34"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#15803D"
					strokeWidth="2.2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="m5 12 5 5 9-10" />
				</svg>
			) : (
				<ClockCountdownIcon size={32} className="text-clay" />
			)}
		</span>
	);
}

const primaryClassName =
	'flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium transition-[background-color,transform] duration-200 enabled:hover:-translate-y-px enabled:hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-55';

function PrimaryButton({
	className,
	size = 'lg',
	...props
}: ComponentProps<'button'> & { size?: 'md' | 'lg' }) {
	return (
		<button
			className={cn(
				primaryClassName,
				size === 'lg' ? 'h-[52px] text-base' : 'h-12 px-5 text-[15px]',
				className,
			)}
			{...props}
		/>
	);
}

function ButtonLink({
	variant,
	className,
	...props
}: ComponentProps<typeof Link> & { variant: 'primary' | 'secondary' }) {
	return (
		<Link
			className={cn(
				'flex h-12 items-center rounded-xl px-5 text-[15px] font-medium',
				variant === 'primary'
					? 'bg-primary px-[22px] text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong'
					: 'border bg-card text-foreground transition-colors hover:bg-surface-2',
				className,
			)}
			{...props}
		/>
	);
}

/** Inline text action ("Criar conta", "Esqueci minha senha"). */
function TextAction({ className, ...props }: ComponentProps<'button'>) {
	return (
		<button
			type="button"
			className={cn(
				'min-h-8 text-sm font-medium text-primary hover:text-primary-strong',
				className,
			)}
			{...props}
		/>
	);
}

function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
	return (
		<Link
			className={cn(
				'inline-flex min-h-8 items-center text-sm font-medium text-primary hover:text-primary-strong',
				className,
			)}
			{...props}
		/>
	);
}

/** "Ainda não tem conta? Criar conta" row. */
function SwitchPrompt({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex items-center gap-2 border-t pt-1.5 text-sm text-muted-foreground">
			{children}
		</div>
	);
}

export {
	Accent,
	AuthHeading,
	AuthScreen,
	ButtonLink,
	FormAlert,
	PasswordField,
	PasswordStrengthMeter,
	PrimaryButton,
	StatusIcon,
	StatusNotice,
	SwitchPrompt,
	TextAction,
	TextField,
	TextLink,
};
