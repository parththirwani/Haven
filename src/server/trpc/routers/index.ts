import { router } from '../trpc';
import { authRouter } from './auth';
import { onboardingRouter } from './onboarding';
import { profileRouter } from './profile';

const appRouter = router({
  auth: authRouter,
  onboarding: onboardingRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;