import { dev } from '$app/environment';

export const BASE_URL = dev ? 'http://localhost:5173' : 'https://pickems.nmckee.org';

export const WCA_URL = 'https://staging.worldcubeassociation.org';
// export const APPLICATION_ID = '4yQGrgzDGJdfozVgKphX7FqQqaNF1xpD-42U_5b3FCo'
export const APPLICATION_ID = 'SShVOFJ3BgNoCgwF8cB-fITXyz9yyRHPbRXt5cNKdcA';
export const redirectURI = `${BASE_URL}/login`;

export const MAX_PICKS = 8;

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
