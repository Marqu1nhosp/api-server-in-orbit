import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { createGoal } from '../../functions/create-goal';
import { createGoalCompletion } from '../../functions/create-goal-completion';

export const createCompletionRoute: FastifyPluginAsyncZod = async function (app) {
    app.post('/completions', {
        schema: {
            body: z.object({
                goalId: z.string()
            })
        }
    }, async (request) => {
        const { goalId } = request.body

        await createGoalCompletion({
            goalId
        })

    })
};