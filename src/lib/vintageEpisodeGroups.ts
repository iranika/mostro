import type { MangaEpisode } from './mangaData';

export type VintageEpisodeGroup = {
	id: string;
	label: string;
	episodes: MangaEpisode[];
	/** 旧サイトの Panel391 のようにチェックボックスを付けないグループ */
	openByDefault?: boolean;
};

export type VintageMenuPromo = {
	href: string;
	label: string;
};

export type VintageMenuChunk = {
	groups: VintageEpisodeGroup[];
	promoAfter?: VintageMenuPromo;
};

type GroupRule = {
	id: string;
	label: string;
	match: (episode: MangaEpisode) => boolean;
	openByDefault?: boolean;
};

function numericIndex(index: number | string): number | null {
	if (index === 'ri') return null;
	const n = Number(index);
	return Number.isFinite(n) ? n : null;
}

function inRange(index: number | string, min: number, max: number): boolean {
	const n = numericIndex(index);
	return n !== null && n >= min && n <= max;
}

/** 旧 FC2 サイト (mocode.html) の Panel ID・ラベルに合わせる */
const FIXED_GROUP_RULES: GroupRule[] = [
	{ id: 'Panel1', label: '1～9話', match: (ep) => inRange(ep.Index, 1, 9) },
	{ id: 'Panel10', label: '10～20話', match: (ep) => inRange(ep.Index, 10, 20) },
	{ id: 'Panel21', label: 'すずな。21～24話', match: (ep) => inRange(ep.Index, 21, 24) },
	{ id: 'Panel25', label: '25～30話', match: (ep) => inRange(ep.Index, 25, 30) },
	{ id: 'Panel31', label: '31～40話', match: (ep) => inRange(ep.Index, 31, 40) },
	{ id: 'Panel41', label: '41～50話', match: (ep) => inRange(ep.Index, 41, 50) },
	{ id: 'Panel51', label: '51話～', match: (ep) => inRange(ep.Index, 51, 60) },
	{ id: 'Panel61', label: '61話～', match: (ep) => inRange(ep.Index, 61, 70) },
	{ id: 'Panel71', label: '71話～', match: (ep) => inRange(ep.Index, 71, 80) },
	{ id: 'Panel-rireki', label: '履歴書', match: (ep) => ep.Index === 'ri' },
	{ id: 'Panel81', label: '81話～', match: (ep) => inRange(ep.Index, 81, 90) },
	{ id: 'Panel91', label: '91話～', match: (ep) => inRange(ep.Index, 91, 100) },
];

function decadeGroupRules(episodes: MangaEpisode[]): GroupRule[] {
	const maxIndex = episodes.reduce((max, ep) => {
		const n = numericIndex(ep.Index);
		return n !== null && n > max ? n : max;
	}, 0);

	const rules: GroupRule[] = [];
	for (let start = 101; start <= maxIndex; start += 10) {
		const end = start + 9;
		rules.push({
			id: `Panel${start}`,
			label: `${start}話～`,
			match: (ep) => inRange(ep.Index, start, end),
		});
	}
	return rules;
}

export function buildVintageEpisodeGroups(episodes: MangaEpisode[]): VintageEpisodeGroup[] {
	const rules = [...FIXED_GROUP_RULES, ...decadeGroupRules(episodes)];

	const groups = rules
		.map((rule) => ({
			id: rule.id,
			label: rule.label,
			episodes: episodes.filter(rule.match),
			openByDefault: rule.openByDefault,
		}))
		.filter((group) => group.episodes.length > 0);

	// 旧サイトの Panel391 と同様、最終グループはチェックボックスなしで常時表示
	const last = groups.at(-1);
	if (last) last.openByDefault = true;

	return groups;
}

/** 旧サイト同様、menu ブロックを 161話 / 291話 前後で分割する */
export function buildVintageMenuChunks(episodes: MangaEpisode[]): VintageMenuChunk[] {
	const groups = buildVintageEpisodeGroups(episodes);
	const idx171 = groups.findIndex((g) => g.id === 'Panel171');
	const idx301 = groups.findIndex((g) => g.id === 'Panel301');

	const menu1Groups = idx171 >= 0 ? groups.slice(0, idx171) : groups;
	const menu2Groups = idx171 >= 0 && idx301 >= 0 ? groups.slice(idx171, idx301) : [];
	const menu3Groups = idx301 >= 0 ? groups.slice(idx301) : [];

	const chunks: VintageMenuChunk[] = [{ groups: menu1Groups }];

	if (menu2Groups.length > 0) {
		chunks[0].promoAfter = {
			href: 'https://momotori.booth.pm/items/2144248',
			label: '夏の日',
		};
		chunks.push({ groups: menu2Groups });
	}

	if (menu3Groups.length > 0) {
		const lastChunk = chunks[chunks.length - 1];
		lastChunk.promoAfter = {
			href: 'https://momotori.booth.pm/items/4153650',
			label: '残暑お見舞い',
		};
		chunks.push({ groups: menu3Groups });
	}

	return chunks;
}
