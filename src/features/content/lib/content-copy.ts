import type { ProductArtKind } from '@/features/catalog/lib/product-visuals';

import type {
	ContentSlug,
	FaqEntry,
	LookbookScene,
	SectionsPage,
} from '../model/content';

/**
 * Copy of Conteudo.dc.html. The mockup's [BRACKETS] (founder, contacts,
 * legal entity, review notes) are replaced by honest demo copy: Marfim is a
 * demonstration store whose payments run in Stripe's test mode
 * (Docs/specs/content/content-pages.md, decision 1). No dispatch lead time
 * is promised (decision 2).
 */

const DEMO_NOTICE =
	'A Marfim é uma loja de demonstração: os ateliês e as peças são fictícios e os pagamentos usam o modo de teste do Stripe, sem cobrança real.';

const principles = [
	{
		n: '01',
		title: 'Feito à mão, de verdade',
		text: 'Só entram na loja peças de ateliês que conhecemos pelo nome. Nada de revenda de fábrica.',
	},
	{
		n: '02',
		title: 'Poucas peças, bem feitas',
		text: 'Lotes pequenos e materiais que envelhecem bem: cerâmica, madeira, latão, linho.',
	},
	{
		n: '03',
		title: 'Quem fez, assina',
		text: 'Cada página de produto diz qual ateliê fez a peça, e o nome dele segue com o pedido.',
	},
] as const;

/** Drawing and text of each atelier, by the products' `brand`. */
const atelierStories: Record<string, { kind: ProductArtKind; text: string }> = {
	'Estúdio Barro Cru': {
		kind: 'vase',
		text: 'Cerâmica de alta temperatura queimada em forno a lenha, com argila local e esmalte de cinzas.',
	},
	'Oficina Tora': {
		kind: 'chair',
		text: 'Marcenaria em madeira de reflorestamento, com encaixes sem prego.',
	},
	'Oficina Faísca': {
		kind: 'pendant',
		text: 'Luminárias em latão e vidro soprado, montadas uma a uma.',
	},
	'Tear Alto': {
		kind: 'throw',
		text: 'Tecelagem em tear de pedal, com fios tingidos no próprio ateliê.',
	},
};

const sellCriteria = [
	{
		n: '01',
		title: 'Feito à mão',
		text: 'Produção artesanal, em lote pequeno, com o nome de quem faz.',
	},
	{
		n: '02',
		title: 'Constância',
		text: 'Capacidade de repor as peças com qualidade parecida ao longo da estação.',
	},
	{
		n: '03',
		title: 'Cuidado no envio',
		text: 'Conferir, embalar bem e despachar cada pedido assim que o pagamento é confirmado.',
	},
] as const;

const sellSteps = [
	{
		n: '1',
		title: 'Você manda o portfólio',
		text: 'Fotos, técnica, cidade e quantas peças consegue produzir por mês.',
	},
	{
		n: '2',
		title: 'Conversamos',
		text: 'Visitamos o ateliê (ou fazemos uma chamada) e escolhemos as peças juntos.',
	},
	{
		n: '3',
		title: 'Fotos e cadastro',
		text: 'Fotografamos e cadastramos as peças com o nome do ateliê.',
	},
	{
		n: '4',
		title: 'Pedidos chegam',
		text: 'Você recebe o pedido, embala e entrega para a coleta.',
	},
] as const;

const lookbookScenes: readonly LookbookScene[] = [
	{
		title: 'MESA DE JANTAR',
		background: '#ECECFD',
		ink: '#3B3FD9',
		height: 420,
		pieces: [
			{ kind: 'pendant', size: 150 },
			{ kind: 'vase', size: 90 },
		],
		productSlugs: ['pendente-orbe', 'vaso-duna'],
	},
	{
		title: 'CANTO DE LEITURA',
		background: '#FCEEE4',
		ink: '#B4501E',
		height: 420,
		pieces: [
			{ kind: 'chair', size: 150 },
			{ kind: 'lamp', size: 130 },
		],
		productSlugs: ['cadeira-lina', 'luminaria-arco'],
	},
	{
		title: 'CAFÉ DA MANHÃ',
		background: '#E8F5EC',
		ink: '#15803D',
		height: 320,
		pieces: [
			{ kind: 'mug', size: 90 },
			{ kind: 'jar', size: 110 },
			{ kind: 'bowl', size: 90 },
		],
		productSlugs: ['par-de-canecas-grao', 'jarra-seixo'],
	},
	{
		title: 'SOFÁ',
		background: '#F1F0EC',
		ink: '#44444A',
		height: 320,
		pieces: [
			{ kind: 'throw', size: 130 },
			{ kind: 'throw', size: 90 },
		],
		productSlugs: ['manta-trama', 'almofada-linho'],
	},
];

const faqEntries: readonly FaqEntry[] = [
	{
		category: 'Pedidos',
		question: 'Como acompanho meu pedido?',
		answer:
			'Em Minha conta › Meus pedidos. A linha do tempo atualiza sozinha a cada etapa, e o rastreio aparece quando a transportadora coleta.',
	},
	{
		category: 'Pedidos',
		question: 'Posso cancelar um pedido?',
		answer:
			'Sim, pela página do pedido, enquanto o ateliê não começou o preparo. Depois disso, use a troca ou devolução.',
	},
	{
		category: 'Pagamento',
		question: 'Quais formas de pagamento vocês aceitam?',
		answer:
			'Cartão de crédito. Os dados do cartão vão direto para o Stripe, o processador de pagamento; a Marfim não guarda o número.',
	},
	{
		category: 'Pagamento',
		question: 'Posso pagar com meu cartão de verdade?',
		answer:
			'Não. Esta é uma loja de demonstração e os pagamentos estão em modo de teste: use o cartão 4242 4242 4242 4242, com qualquer validade futura e qualquer CVC. Nada é cobrado.',
	},
	{
		category: 'Pagamento',
		question: 'Tem Pix ou parcelamento?',
		answer: 'Pix com desconto e parcelamento estão a caminho.',
		soon: true,
	},
	{
		category: 'Pagamento',
		question: 'Meu pagamento não foi aprovado. E agora?',
		answer:
			'Nenhum valor é cobrado e as peças voltam ao estoque. Sua sacola continua salva: confira os dados ou use outro cartão e tente de novo.',
	},
	{
		category: 'Entrega',
		question: 'Quanto custa o frete e qual o prazo?',
		answer:
			'O cálculo de frete e prazo pelo CEP está chegando. Depois que o pagamento é confirmado, você acompanha cada etapa em Meus pedidos.',
		soon: true,
	},
	{
		category: 'Trocas',
		question: 'Qual o prazo para trocar ou devolver?',
		answer:
			'30 dias a partir do recebimento. Veja o passo a passo em Trocas e devoluções.',
	},
	{
		category: 'Conta',
		question: 'Não recebi o e-mail de confirmação.',
		answer:
			'Confira o spam e peça um novo link na faixa do topo do site. O link vale 24 horas.',
	},
	{
		category: 'Conta',
		question: 'Esqueci minha senha.',
		answer:
			'Use “Esqueci minha senha” na tela de entrar. O link chega por e-mail e vale 30 minutos.',
	},
];

const sectionsPages: Partial<Record<ContentSlug, SectionsPage>> = {
	prazos: {
		eyebrow: 'AJUDA',
		title: 'Prazos e frete',
		intro:
			'Cada peça sai direto do ateliê que a fez. O prazo total soma o preparo no ateliê e o transporte.',
		soon: 'Cálculo de frete e prazo pelo CEP, entrega expressa e frete grátis acima de R$ 299.',
		sections: [
			{
				id: 'preparo',
				heading: 'Preparo no ateliê',
				text: 'Depois da confirmação do pagamento, o ateliê confere, embala e despacha a peça. Você acompanha cada etapa em Meus pedidos.',
			},
			{
				id: 'transporte',
				heading: 'Transporte',
				text: 'O prazo de transporte depende da região e da transportadora. Nesta loja de demonstração, as entregas não são reais.',
			},
			{
				id: 'rastreio',
				heading: 'Rastreio',
				text: 'Quando a transportadora coleta, o código aparece em Meus pedidos e chega por e-mail.',
			},
		],
	},
	cuidados: {
		eyebrow: 'AJUDA',
		title: 'Cuidados com as peças',
		intro:
			'Peças feitas à mão duram muito com cuidados simples. Pequenas variações de cor e forma são parte do processo.',
		sections: [
			{
				id: 'ceramica',
				heading: 'Cerâmica',
				text: 'Pode ir à lava-louças e ao micro-ondas, exceto peças com detalhes metálicos. Evite choque térmico: não leve do congelador direto ao forno.',
			},
			{
				id: 'madeira',
				heading: 'Madeira',
				text: 'Limpe com pano levemente úmido. A cada seis meses, aplique óleo vegetal ou cera de abelha para manter a proteção.',
			},
			{
				id: 'latao',
				heading: 'Latão e vidro',
				text: 'O latão escurece com o tempo e ganha pátina. Para manter o brilho, use cera neutra. Limpe o vidro com pano macio e seco.',
			},
			{
				id: 'tecidos',
				heading: 'Algodão e linho',
				text: 'Lave à mão ou no ciclo delicado, em água fria, e seque à sombra. O linho amacia a cada lavagem.',
			},
		],
	},
	privacidade: {
		eyebrow: 'LEGAL',
		title: 'Política de privacidade',
		intro: `${DEMO_NOTICE} Esta página explica quais dados a loja guarda, por que e como você controla esses dados.`,
		soon: 'Baixar os seus dados e excluir a conta pela própria loja.',
		sections: [
			{
				id: 'coleta',
				heading: 'Dados que coletamos',
				text: 'Nome, e-mail, telefone e endereços que você informa, e o histórico dos seus pedidos. Os dados do cartão vão direto ao Stripe e não passam pela Marfim.',
			},
			{
				id: 'uso',
				heading: 'Para que usamos',
				text: 'Processar pedidos, enviar e-mails sobre a conta e os pedidos, e proteger a sua conta, por exemplo bloqueando tentativas repetidas de senha.',
			},
			{
				id: 'compartilhamento',
				heading: 'Com quem compartilhamos',
				text: 'Com o Stripe, para processar o pagamento em modo de teste. Nesta demonstração, nenhum dado vai para ateliês ou transportadoras.',
			},
			{
				id: 'cookies',
				heading: 'Cookies e armazenamento',
				text: 'Um cookie seguro mantém a sua sessão, e o navegador guarda a sacola e o acesso à conta. Não usamos cookies de publicidade.',
			},
			{
				id: 'direitos',
				heading: 'Seus direitos (LGPD)',
				text: 'Você vê e corrige os seus dados e endereços em Minha conta.',
			},
		],
	},
	termos: {
		eyebrow: 'LEGAL',
		title: 'Termos de uso',
		intro: `${DEMO_NOTICE} Ao usar a loja, você concorda com as regras abaixo.`,
		sections: [
			{
				id: 'demonstracao',
				heading: 'Loja de demonstração',
				text: 'Nenhuma compra gera cobrança ou entrega. Use os cartões de teste do Stripe, como 4242 4242 4242 4242, com qualquer validade futura e qualquer CVC. Não digite os dados de um cartão real.',
			},
			{
				id: 'conta',
				heading: 'Conta',
				text: 'Você é responsável pela senha da sua conta. Para finalizar compras, o e-mail precisa estar confirmado.',
			},
			{
				id: 'precos',
				heading: 'Preços e estoque',
				text: 'Preço e disponibilidade são conferidos de novo no momento do pagamento. Se algo mudar, avisamos antes de cobrar.',
			},
			{
				id: 'pagamento',
				heading: 'Pagamento',
				text: 'Aceitamos cartão de crédito. O pedido só é confirmado depois da aprovação do pagamento.',
			},
			{
				id: 'trocas',
				heading: 'Trocas e cancelamentos',
				text: 'Valem as regras da página Trocas e devoluções e o Código de Defesa do Consumidor.',
			},
		],
	},
};

export {
	atelierStories,
	DEMO_NOTICE,
	faqEntries,
	lookbookScenes,
	principles,
	sectionsPages,
	sellCriteria,
	sellSteps,
};
