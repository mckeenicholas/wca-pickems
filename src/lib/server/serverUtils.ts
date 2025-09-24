import { db } from './db';
import { Users } from './db/schema';
import { eq } from 'drizzle-orm';

export const createServerLog = (message: string, level: 'log' | 'error' = 'log') => {
	const timestamp = new Date().toISOString();
	if (level === 'error') {
		console.error(`[${timestamp}] ${message}`);
	} else {
		console.log(`[${timestamp}] ${message}`);
	}
};

export const isAdmin = async (id: number | undefined) => {
	if (id == undefined) {
		return false;
	}

	const isAdminQuery = await db
		.select({ isAdmin: Users.isAdmin })
		.from(Users)
		.where(eq(Users.id, id))
		.limit(1);

	return isAdminQuery.length && isAdminQuery[0].isAdmin;
};
