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

const formatMulti = (result: number) => {
	const missed = result % 100;
	const T_seconds = Math.floor(result / 100) % 100000;
	const DD = Math.floor(result / 10000000) % 100;

	const difference = 99 - DD;
	const solved = difference + missed;
	const attempted = solved + missed;

	let timeStr: string;

	if (T_seconds === 99999) {
		timeStr = 'DNF';
	} else {
		const timeInCentiseconds = T_seconds * 100;
		const seconds = timeInCentiseconds / 100;

		if (seconds >= 60) {
			const minutes = Math.floor(seconds / 60);
			const remainingSeconds = (seconds % 60).toFixed(2);
			timeStr = `${minutes}:${remainingSeconds.padStart(5, '0')}`;
		} else {
			timeStr = seconds.toFixed(2);
		}
	}

	return `${solved}/${attempted} ${timeStr}`;
};

export const formatTime = (time: number | null, isMulti = false): string => {
	if (!time || time <= 0) {
		return '';
	}

	if (isMulti) {
		return formatMulti(time);
	}

	const seconds = time / 100;

	if (seconds >= 60) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = (seconds % 60).toFixed(2);
		return `${minutes}:${remainingSeconds.padStart(5, '0')}`;
	}

	return seconds.toFixed(2);
};
