export function pickTopHeroImage():
	| { src: string; width: number; height: number }
	| undefined {
	const heroCandidates = import.meta.glob<{
		default: { src: string; width: number; height: number };
	}>('../assets/top/**/top.*', { eager: true });
	const entries = Object.entries(heroCandidates).map(([path, mod]) => ({
		path,
		image: mod.default,
	}));

	const preferWebp = entries.find((e) => e.path.endsWith('/top.webp'));
	if (preferWebp) return preferWebp.image;

	const preferJpg = entries.find((e) => e.path.endsWith('/top.jpg'));
	if (preferJpg) return preferJpg.image;

	return undefined;
}
