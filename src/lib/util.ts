import { dev } from '$app/environment';

export const BASE_URL = dev ? 'http://localhost:5173' : 'https://pickems.nmckee.org';

export const WCA_URL = dev
	? 'https://staging.worldcubeassociation.org'
	: 'https://www.worldcubeassociation.org';

export const APPLICATION_ID = dev
	? 'SShVOFJ3BgNoCgwF8cB-fITXyz9yyRHPbRXt5cNKdcA'
	: 'fr7kui7q788Mr_ZK3hvmMNsWvY-q42AjZhDUn6kBhxk';

export const redirectURI = `${BASE_URL}/login`;

export const MAX_PICKS = 8;

export const PAGINATION_SIZE = 25;

export const authFetch = async (
	url: URL | string,
	token: string,
	options: RequestInit = {}
): Promise<Response> => {
	return fetch(url.toString(), {
		...options,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			...options.headers
		}
	});
};

export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	date.setHours(date.getHours() + 12);
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
};
