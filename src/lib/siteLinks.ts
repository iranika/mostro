export type SiteLink = {
	label: string;
	href: string;
	primary?: boolean;
};

export const siteLinks: SiteLink[] = [
	{ label: 'TOP', href: '/', primary: true },
	{ label: 'ブログ', href: 'http://blog.livedoor.jp/kai_tyou/' },
	{
		label: '販売処',
		href: 'https://www.dlsite.com/home/dlaf/=/aid/momoco/url/https%3A%2F%2Fwww.dlsite.com%2Fhome%2Fcircle%2Fprofile%2F%3D%2Fmaker_id%2FRG24350.html%2F%3Futm_medium%3Daffiliate%26utm_campaign%3Dbnlink%26utm_content%3Dtext',
	},
	{ label: 'みちくさびゅあー', href: 'https://momoco.pages.dev/' },
];
