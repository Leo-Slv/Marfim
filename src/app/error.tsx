'use client';

import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ErrorPage } from '@/features/errors/components/error-page';
import { ErrorState } from '@/features/errors/components/error-state';
import {
	errorKindOf,
	errorRetryAfter,
	errorTraceCode,
} from '@/features/errors/lib/error-kind';

export default function RouteError({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	const { reset } = useQueryErrorResetBoundary();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<ErrorPage>
			<ErrorState
				kind={errorKindOf(error)}
				traceCode={errorTraceCode(error)}
				retryAfterSeconds={errorRetryAfter(error)}
				onRetry={() => {
					// Let queries that threw fetch again instead of re-throwing.
					reset();
					retry();
				}}
			/>
		</ErrorPage>
	);
}
