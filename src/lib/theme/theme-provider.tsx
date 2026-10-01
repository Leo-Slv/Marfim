'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { MotionConfig } from 'motion/react';

function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="light"
			enableSystem={false}
			storageKey="marfim-theme"
		>
			{/* Respects prefers-reduced-motion for every motion.* animation in
			    the app: transforms are skipped, opacity fades still play. */}
			<MotionConfig reducedMotion="user">{children}</MotionConfig>
		</NextThemesProvider>
	);
}

export { ThemeProvider };
