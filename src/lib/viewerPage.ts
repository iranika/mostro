import type { MangaEpisode } from './mangaData';

/** URL の ?page= パラメータからエピソードを解決する */
export function findEpisodeByPage(
	page: string | null | undefined,
	episodes: MangaEpisode[],
): MangaEpisode | undefined {
	if (episodes.length === 0) return undefined;
	if (!page || page === '') return episodes[0];

	if (page === 'latest') return episodes.at(-1);

	const idx = episodes.findIndex((episode) => String(episode.Index) === page);
	return idx >= 0 ? episodes[idx] : episodes[0];
}

export function readPageParamFromLocation(): string {
	if (typeof window === 'undefined') return '1';
	return new URLSearchParams(window.location.search).get('page') ?? '1';
}
