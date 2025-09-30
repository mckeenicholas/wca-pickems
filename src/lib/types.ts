export const WCAEvents = [
	'333',
	'222',
	'444',
	'555',
	'666',
	'777',
	'333bf',
	'333fm',
	'333oh',
	'minx',
	'pyram',
	'clock',
	'skewb',
	'sq1',
	'444bf',
	'555bf',
	'333mbf'
] as const;

export const eventNames = {
	'333': '3x3x3 Cube',
	'222': '2x2x2 Cube',
	'444': '4x4x4 Cube',
	'555': '5x5x5 Cube',
	'666': '6x6x6 Cube',
	'777': '7x7x7 Cube',
	'333bf': '3x3x3 Blindfolded',
	'333fm': '3x3x3 Fewest Moves',
	'333oh': '3x3x3 One-Handed',
	minx: 'Megaminx',
	pyram: 'Pyraminx',
	clock: 'Clock',
	skewb: 'Skewb',
	sq1: 'Square-1',
	'444bf': '4x4x4 Blindfolded',
	'555bf': '5x5x5 Blindfolded',
	'333mbf': '3x3x3 Multi-Blind'
} as const;

export const eventOrderIdx: Record<WCAEvent, number> = {
	'333': 0,
	'222': 1,
	'444': 2,
	'555': 3,
	'666': 4,
	'777': 5,
	'333bf': 6,
	'333fm': 7,
	'333oh': 8,
	clock: 9,
	minx: 10,
	pyram: 11,
	skewb: 12,
	sq1: 13,
	'444bf': 14,
	'555bf': 15,
	'333mbf': 16
} as const;

export type WCAEvent = (typeof WCAEvents)[number];

export interface WCAOauthResponse {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	created_at: number;
}

export interface WCAUserResponseInfo {
	me: {
		name: string;
		id: number;
		wca_id: string;
	};
}

export type WcifData = {
	formatVersion: string;
	id: string;
	name: string;
	shortName: string;
	persons: Person[];
	events: EventDetail[];
	schedule: Schedule;
	competitorLimit: number;
	registrationInfo: RegistrationInfo;
};

export type Person = {
	name: string;
	wcaUserId: number;
	wcaId: string | null;
	registrantId: number | null;
	countryIso2: string;
	gender: string;
	registration: {
		wcaRegistrationId: number;
		eventIds: string[];
		status: string;
		isCompeting: boolean;
	} | null;
	personalBests: PersonalBest[];
};

export type PersonalBest = {
	eventId: string;
	best: number;
	worldRanking: number;
	continentalRanking: number;
	nationalRanking: number;
	type: 'average' | 'single';
};

export type EventDetail = {
	id: string;
	rounds: Round[];
	extensions: unknown[];
	qualification: {
		type: string;
		resultType: string;
		whenDate: string;
		level: number;
	} | null;
};

export type Round = {
	id: string;
	format: string;
	timeLimit: {
		centiseconds: number;
		cumulativeRoundIds: string[];
	} | null;
	cutoff: unknown | null;
	advancementCondition: {
		type: string;
		level: number;
	} | null;
	scrambleSetCount: number;
};

export type Schedule = {
	startDate: string;
	numberOfDays: number;
	venues: Venue[];
};

export type Venue = {
	id: number;
	name: string;
	latitudeMicrodegrees: number;
	longitudeMicrodegrees: number;
	countryIso2: string;
	timezone: string;
	rooms: Room[];
};

export type Room = {
	id: number;
	name: string;
	color: string;
	activities: Activity[];
};

export type Activity = {
	id: number;
	name: string;
	activityCode: string;
	startTime: string;
	endTime: string;
	childActivities: ChildActivity[];
};

export type ChildActivity = {
	id: number;
	name: string;
	activityCode: string;
	startTime: string;
	endTime: string;
	childActivities: ChildActivity[];
};

export type RegistrationInfo = {
	openTime: string;
	closeTime: string;
	baseEntryFee: number;
	currencyCode: string;
	onTheSpotRegistration: boolean;
	useWcaRegistration: boolean;
};
