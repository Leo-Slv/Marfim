'use client';

import { JetBrains_Mono, Outfit } from 'next/font/google';
import Link from 'next/link';
import { useEffect } from 'react';

import './globals.css';

import { ErrorState } from '@/features/errors/components/error-state';
import { errorTraceCode } from '@/features/errors/lib/error-kind';
import { cn } from '@/lib/utils';

const outfit = Outfit({
	variable: '--font-outfit',
	subsets: ['latin'],
	weight: ['300', '400', '500', '600'],
});

const jetBrainsMono = JetBrains_Mono({
	variable: '--font-jetbrains-mono',
	subsets: ['latin'],
	weight: ['400', '500'],
});

/**
 * Replaces the root layout when it fails itself, so there are no providers
 * (session, queries) and no store header — just the wordmark and the 500.
 */
export default function GlobalError({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html
			lang="pt-BR"
			className={cn(
				'h-full font-sans antialiased',
				outfit.variable,
				jetBrainsMono.variable,
			)}
		>
			<body className="flex min-h-full flex-col bg-background">
				<title>Algo deu errado · Marfim</title>
				<header className="border-b">
					<div className="mx-auto flex h-[72px] max-w-[1280px] items-center px-5 sm:px-10">
						<Link href="/" className="text-xl font-medium tracking-[-0.02em]">
							marfim<span className="text-primary">.</span>
						</Link>
					</div>
				</header>
				<main className="flex grow flex-col">
					<ErrorState
						kind="server"
						traceCode={errorTraceCode(error)}
						onRetry={retry}
					/>
				</main>
			</body>
		</html>
	);
}
