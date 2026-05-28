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
            .replace("../assets/manga/", "")
            .replace(/\/.*\.jpg$/, "")
            .split("_");

        const imageFilename = path.replace(/^.*\//, "");
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

    // natural sort 用の比較関数
    const naturalSort = (a: string, b: string) => {
        const na = a.replace(".jpg", "");
        const nb = b.replace(".jpg", "");

        // 数字部分を抽出（例: "128-10" → [128, 10]）
        const pa = na.split(/[^0-9]+/).map(Number);
        const pb = nb.split(/[^0-9]+/).map(Number);

        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
            if ((pa[i] ?? 0) !== (pb[i] ?? 0)) {
                return (pa[i] ?? 0) - (pb[i] ?? 0);
            }
        }
        return 0;
    };

    return Object.values(episodeMap)
        .map((ep) => {
            const keys = pageKeyMap[String(ep.Index)] ?? [];
            const indexed = ep.ImageUrl.map((url, i) => ({ url, key: keys[i] ?? '' }));
            indexed.sort((a, b) => naturalSort(a.key, b.key));
            return {
                ...ep,
                ImageUrl: indexed.map((v) => v.url),
            };
        })
        .sort((a, b) => Number(a.Index) - Number(b.Index));
}


let cachedEpisodes: MangaEpisode[] | undefined;

export function getMangaEpisodes(): MangaEpisode[] {
	cachedEpisodes ??= buildEpisodes();
	return cachedEpisodes;
}