import { router } from '../trpc';
import { authRouter } from './auth';
import { profileRouter } from './profile';

const appRouter = router({
  auth: authRouter,
  profile: profileRouter
});

export type AppRouter = typeof appRouter;
export default appRouter;