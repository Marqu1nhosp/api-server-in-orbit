import { z } from 'zod';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { getWeekPedingGoals } from '../../functions/get-week-peding-goals';

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async (app) => {
    app.get('/pending-goals', async () => {
        const { pendingGoals } = await getWeekPedingGoals()
    
        return { pendingGoals } 
    })
    
};