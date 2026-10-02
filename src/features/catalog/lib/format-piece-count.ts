/** "1 peça" / "8 peças". */
function formatPieceCount(count: number) {
	return `${count} ${count === 1 ? 'peça' : 'peças'}`;
}

export { formatPieceCount };
