import { router } from '../trpc';
import { authRouter } from './auth';
import { vaultRouter } from './vault';
import { onboardingRouter } from './onboarding';
import { profileRouter } from './profile';

const appRouter = router({
  auth: authRouter,
  onboarding: onboardingRouter,
  profile: profileRouter,
  vault: vaultRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;