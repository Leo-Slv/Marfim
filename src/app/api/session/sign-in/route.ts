import {
	postToOrderCore,
	problem,
	readFields,
	respondWithSession,
} from '@/lib/session/ordercore-server';

export async function POST(request: Request) {
	const body = await readFields(request, ['email', 'password']);
	if (!body) {
		return problem(400, 'validation_error', 'Invalid request.');
	}

	return respondWithSession(
		await postToOrderCore('/api/auth/sign-in', request, { body }),
	);
}
