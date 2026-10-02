'use client';

import { useCallback, useEffect, useState } from 'react';

/** A seconds countdown for "Aguarde Ns" locks after too many attempts. */
function useCountdown() {
	const [endsAt, setEndsAt] = useState<number | null>(null);
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (endsAt === null) {
			return;
		}
		const interval = setInterval(() => {
			const current = Date.now();
			setNow(current);
			if (current >= endsAt) {
				setEndsAt(null);
			}
		}, 250);
		return () => clearInterval(interval);
	}, [endsAt]);

	const start = useCallback((seconds: number) => {
		const current = Date.now();
		setNow(current);
		setEndsAt(current + seconds * 1000);
	}, []);

	const secondsLeft =
		endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));

	return { secondsLeft, locked: secondsLeft > 0, start };
}

export { useCountdown };
