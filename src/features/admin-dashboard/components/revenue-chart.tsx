'use client';

import { useState } from 'react';

import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';

import { chartGeometry } from '../lib/dashboard-metrics';
import { formatDayLabel } from '../lib/dashboard-period';
import { Panel, PanelError, PanelTitle, Skeleton } from './dashboard-ui';

const WIDTH = 720;
const HEIGHT = 200;
const TOP = 10;

/** "Receita por dia" (no daily goal — admin dashboard pendency #2). */
function RevenueChart({
	days,
	values,
	failed,
	onRetry,
}: {
	days: readonly string[];
	values: readonly number[] | undefined;
	failed: boolean;
	onRetry: () => void;
}) {
	return (
		<Panel className="gap-3 px-3.5 py-3.5 [animation-delay:.1s] min-[980px]:px-[22px] min-[980px]:py-5 min-[1180px]:col-span-8">
			<div className="flex items-baseline gap-3">
				<PanelTitle>Receita por dia</PanelTitle>
				<span className="text-xs text-muted-foreground">
					últimos {days.length} dias
				</span>
			</div>
			{failed ? (
				<PanelError onRetry={onRetry} />
			) : values ? (
				// Remount per period so the line draws itself again.
				<Chart key={days[0]} days={days} values={values} />
			) : (
				<Skeleton className="h-[230px]" />
			)}
		</Panel>
	);
}

function Chart({
	days,
	values,
}: {
	days: readonly string[];
	values: readonly number[];
}) {
	const [hover, setHover] = useState<number | null>(null);
	const chart = chartGeometry(values, {
		width: WIDTH,
		height: HEIGHT,
		top: TOP,
	});
	const labelIndexes =
		days.length > 7
			? [0, 10, 20, days.length - 1]
			: days.map((_, index) => index);
	const total = values.reduce((sum, value) => sum + value, 0);
	const point = hover === null ? null : chart.points[hover];

	return (
		<div className="relative h-[230px]">
			<svg
				width="100%"
				height="230"
				viewBox={`0 0 ${WIDTH} 230`}
				preserveAspectRatio="none"
				className="block overflow-visible"
				role="img"
				aria-label={`Receita por dia, últimos ${days.length} dias: ${formatCurrencyBrl(Math.round(total))} no total`}
			>
				<line x1="0" y1={TOP} x2={WIDTH} y2={TOP} stroke="#F1F0EC" />
				<line
					x1="0"
					y1={(HEIGHT + TOP) / 2}
					x2={WIDTH}
					y2={(HEIGHT + TOP) / 2}
					stroke="#F1F0EC"
				/>
				<line x1="0" y1={HEIGHT} x2={WIDTH} y2={HEIGHT} stroke="#E6E4DE" />
				<path
					d={chart.areaPath}
					fill="#ECECFD"
					className="animate-fade-in [animation-delay:.4s] [animation-duration:1.2s]"
				/>
				<path
					d={chart.linePath}
					fill="none"
					stroke="#3B3FD9"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					vectorEffect="non-scaling-stroke"
					strokeDasharray="2000"
					className="animate-draw-line"
				/>
			</svg>
			<div
				className="absolute inset-x-0 top-0 flex h-[200px]"
				onMouseLeave={() => setHover(null)}
			>
				{values.map((_, index) => (
					<div
						key={days[index]}
						className="h-full grow hover:bg-primary/[0.04]"
						onMouseEnter={() => setHover(index)}
					/>
				))}
			</div>
			{point && hover !== null ? (
				<>
					<div
						className="pointer-events-none absolute top-0 h-[200px] border-l border-[#C9C7C0]"
						style={{ left: `${(point.x / WIDTH) * 100}%` }}
					/>
					<div
						className="pointer-events-none absolute -mt-[5px] -ml-[5px] size-2.5 rounded-full border-2 border-white bg-primary"
						style={{ left: `${(point.x / WIDTH) * 100}%`, top: point.y }}
					/>
					<div
						className="pointer-events-none absolute top-1 flex flex-col gap-0.5 rounded-[10px] bg-foreground px-3 py-2 text-xs whitespace-nowrap text-white"
						style={{
							left: `${(point.x / WIDTH) * 100}%`,
							transform:
								hover > values.length * 0.7
									? 'translateX(calc(-100% - 10px))'
									: 'translateX(10px)',
						}}
					>
						<span className="font-mono text-[10px] text-[#A1A1A8]">
							{formatDayLabel(days[hover])}
						</span>
						<span className="font-mono text-[13px]">
							{formatCurrencyBrl(Math.round(values[hover]))}
						</span>
					</div>
				</>
			) : null}
			<div className="absolute inset-x-0 bottom-0 flex justify-between font-mono text-[10px] text-muted-foreground">
				{labelIndexes.map((index) => (
					<span key={days[index]}>{formatDayLabel(days[index])}</span>
				))}
			</div>
		</div>
	);
}

export { RevenueChart };
