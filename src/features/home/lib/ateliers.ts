/**
 * Editorial atelier data from Docs/design/mockups/Main.dc.html. OrderCore
 * only has the atelier's name (`brand` on each product), so everything else
 * lives here, keyed by that name (backend pendency #5 in
 * Docs/backend-pendencies/storefront/home.md).
 */
type AtelierArtKind = 'clay' | 'wood' | 'light' | 'loom';

type Atelier = {
	num: string;
	/** Must match the products' `brand` in OrderCore. */
	name: string;
	city: string;
	craft: string;
	technique: string;
	material: string;
	tint: string;
	art: AtelierArtKind;
	/** Shipping-label code. */
	code: string;
};

const ateliers: readonly Atelier[] = [
	{
		num: '01',
		name: 'Estúdio Barro Cru',
		city: 'CUNHA · SP',
		craft: 'Cerâmica',
		technique: 'Queima a lenha, 1.280 °C',
		material: 'Argila local e esmalte de cinzas',
		tint: '#FCEEE4',
		art: 'clay',
		code: 'MF-BC-0142',
	},
	{
		num: '02',
		name: 'Oficina Tora',
		city: 'GONÇALVES · MG',
		craft: 'Marcenaria',
		technique: 'Encaixes sem prego',
		material: 'Freijó de reflorestamento',
		tint: '#E8F5EC',
		art: 'wood',
		code: 'MF-OT-0087',
	},
	{
		num: '03',
		name: 'Oficina Faísca',
		city: 'SÃO PAULO · SP',
		craft: 'Iluminação',
		technique: 'Vidro soprado à boca',
		material: 'Latão escovado e vidro',
		tint: '#ECECFD',
		art: 'light',
		code: 'MF-OF-0213',
	},
	{
		num: '04',
		name: 'Tear Alto',
		city: 'RESENDE COSTA · MG',
		craft: 'Tecelagem',
		technique: 'Tear de pedal manual',
		material: 'Algodão e linho tingidos no ateliê',
		tint: '#F1F0EC',
		art: 'loom',
		code: 'MF-TA-0058',
	},
];

export type { Atelier, AtelierArtKind };
export { ateliers };
