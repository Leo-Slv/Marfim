import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { AppQueryProvider } from '@/lib/query/providers';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { Toaster } from '@/components/ui/sonner';

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

export const metadata: Metadata = {
	title: 'Marfim',
	description: 'Marfim — loja online.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html
			lang="pt-BR"
			suppressHydrationWarning
			className={cn(
				'h-full',
				'antialiased',
				'font-sans',
				outfit.variable,
				jetBrainsMono.variable,
			)}
		>
			<body className="flex min-h-full flex-col">
				<ThemeProvider>
					<AppQueryProvider>
						{children}
						<Toaster />
					</AppQueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
