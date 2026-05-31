import type { ImageMetadata } from 'astro';
import { comparePageKeys, parseMangaFilename } from './mangaParse';

const mangaImages = import.meta.glob<{ default: ImageMetadata }>(
	'../assets/manga/*/*.jpg',
	{ eager: true },
);

export interface MangaData {
	episodes: MangaEpisode[];
}

export type MangaEpisode = {
	Index: number | string;
	Title: string;
	ImageUrl: string[];
};

function buildEpisodes(): MangaEpisode[] {
	const episodeMap: Record<string, MangaEpisode> = {};
	const pageKeyMap: Record<string, string[]> = {};

	for (const [path, mod] of Object.entries(mangaImages)) {
		let [index, title] = path
			.replace('../assets/manga/', '')
			.replace(/\/.*\.jpg$/, '')
			.split('_');

		const imageFilename = path.replace(/^.*\//, '');
		const imageURL = mod.default.src;

		if (!episodeMap[index]) {
			episodeMap[index] = {
				Index: index,
				Title: title,
				ImageUrl: [],
			};
			pageKeyMap[index] = [];
		}

		episodeMap[index].ImageUrl.push(imageURL);
		pageKeyMap[index].push(imageFilename);
	}

	return Object.values(episodeMap)
		.map((ep) => {
			const keys = pageKeyMap[String(ep.Index)] ?? [];
			const indexed = ep.ImageUrl.map((url, i) => ({ url, key: keys[i] ?? '' }));
			indexed.sort((a, b) => {
				const pageA = parseMangaFilename(a.key)?.pageKey ?? [0];
				const pageB = parseMangaFilename(b.key)?.pageKey ?? [0];
				return comparePageKeys(pageA, pageB);
			});
			return {
				...ep,
				ImageUrl: indexed.map((v) => v.url),
			};
		})
		.sort((a, b) => episodeSortKey(a.Index) - episodeSortKey(b.Index));
}

/** Index は数値順。"ri" のみ 80 と 81 の間（80.5 相当） */
function episodeSortKey(index: number | string): number {
	if (index === 'ri') return 80.5;
	return Number(index);
}

let cachedEpisodes: MangaEpisode[] | undefined;

export function getMangaEpisodes(): MangaEpisode[] {
	cachedEpisodes ??= buildEpisodes();
	return cachedEpisodes;
}

export function formatEpisodeLabel(
	episode: MangaEpisode,
	options: { includeTitle?: boolean } = {},
): string {
	const label = `第${episode.Index}話`;
	return options.includeTitle ? `${label} ${episode.Title}` : label;
}
