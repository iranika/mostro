import type { MangaEpisode } from './mangaData';

export type VintageEpisodeGroup = {
	id: string;
	label: string;
	episodes: MangaEpisode[];
};

type GroupRule = {
	id: string;
	label: string;
	match: (episode: MangaEpisode) => boolean;
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

/** 旧 FC2 サイト (mocode.html) の話数グループ構成に合わせる */
const FIXED_GROUP_RULES: GroupRule[] = [
	{ id: 'panel-1-9', label: '1～9話', match: (ep) => inRange(ep.Index, 1, 9) },
	{ id: 'panel-10-20', label: '10～20話', match: (ep) => inRange(ep.Index, 10, 20) },
	{ id: 'panel-21-24', label: 'すずな。21～24話', match: (ep) => inRange(ep.Index, 21, 24) },
	{ id: 'panel-25-30', label: '25～30話', match: (ep) => inRange(ep.Index, 25, 30) },
	{ id: 'panel-31-40', label: '31～40話', match: (ep) => inRange(ep.Index, 31, 40) },
	{ id: 'panel-41-50', label: '41～50話', match: (ep) => inRange(ep.Index, 41, 50) },
	{ id: 'panel-51-60', label: '51話～', match: (ep) => inRange(ep.Index, 51, 60) },
	{ id: 'panel-61-70', label: '61話～', match: (ep) => inRange(ep.Index, 61, 70) },
	{ id: 'panel-71-80', label: '71話～', match: (ep) => inRange(ep.Index, 71, 80) },
	{ id: 'panel-ri', label: '履歴書', match: (ep) => ep.Index === 'ri' },
	{ id: 'panel-81-90', label: '81話～', match: (ep) => inRange(ep.Index, 81, 90) },
	{ id: 'panel-91-100', label: '91話～', match: (ep) => inRange(ep.Index, 91, 100) },
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
			id: `panel-${start}`,
			label: `${start}話～`,
			match: (ep) => inRange(ep.Index, start, end),
		});
	}
	return rules;
}

export function buildVintageEpisodeGroups(episodes: MangaEpisode[]): VintageEpisodeGroup[] {
	const rules = [...FIXED_GROUP_RULES, ...decadeGroupRules(episodes)];

	return rules
		.map((rule) => ({
			id: rule.id,
			label: rule.label,
			episodes: episodes.filter(rule.match),
		}))
		.filter((group) => group.episodes.length > 0);
}
