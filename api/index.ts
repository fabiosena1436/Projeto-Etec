import { createHandler } from '../server/handler';
import { getDb } from '../server/db';
export default { fetch: createHandler(getDb) };
