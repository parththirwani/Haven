import { router } from '../trpc';
import { authRouter } from './auth';

const appRouter = router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;