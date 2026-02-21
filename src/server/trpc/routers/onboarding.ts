import crypto from 'node:crypto';
import { onboardingInputSchema, onboardingResultSchema } from "../models/onboarding";
import { protectedProcedure, router } from "../trpc";
import { prisma } from '@/src/lib/prisma';

export const onboardingRouter = router({
    onboarding: protectedProcedure
    .input(onboardingInputSchema)
    .output(onboardingResultSchema)
    .mutation(async ({input, ctx})=>{
        const keySalt = crypto.randomBytes(32).toString('hex');  

        try{
            await prisma.user.update({
                where:{
                    id: ctx.user.id
                },
                data:{
                    keySalt,
                    username: input.username,
                    avatar: input.avatar,
                    socialLinks: input.socialLinks
                }
            })
            return {
                success: true,
                message: "Onboarded Sucessfully",
                keySalt
            };
        }catch(err){
            console.error("Onboarding Error"+err)
        }return{
            success: false,
            message:"Failed to complete onboarding"
        }
    })
    
})