import dayjs from "dayjs";

import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";



export async function getWeekPedingGoals() {
    const firstDayOkWeek = dayjs().startOf('week').toDate()
    const lastDayOfWeek = dayjs().endOf('week').toDate()


    const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
        db
            .select({
                id: goals.id,
                title: goals.title,
                desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
                createdAt: goals.createdAt,
            }).from(goals).where(lte(goals.createdAt, lastDayOfWeek))
    )

    const goalsCompletionCounts = db.$with('goals_completion_counts').as(
        db.select({
            goalId: goalCompletions.goalId,
            completionCount: count(goalCompletions.id).mapWith(Number).as('completionCount'),
        })
            .from(goalCompletions)
            .where(and(
                gte(goalCompletions.createdAt, firstDayOkWeek),
                lte(goalCompletions.createdAt, lastDayOfWeek)
            ))
            .groupBy(goalCompletions.goalId)
    )

    const pendingGoals = await db
        .with(goalsCreatedUpToWeek, goalsCompletionCounts)
        .select({
            id: goalsCreatedUpToWeek.id,
            title: goalsCreatedUpToWeek.title,
            desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
            completionCount: sql/*sql*/`
                COALESCE(${goalsCompletionCounts.completionCount}, 0)
            `.mapWith(Number),
        })
        .from(goalsCreatedUpToWeek)
        .leftJoin(goalsCompletionCounts, eq(goalsCompletionCounts.goalId, goalsCreatedUpToWeek.id))

    return { pendingGoals }

}