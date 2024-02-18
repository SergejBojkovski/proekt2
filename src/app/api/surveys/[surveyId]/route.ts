import prisma from "@/lib/prisma";
import Survey from "@/schemas/Survey";
import routeHandler from "@/lib/routeHandler";
import { SurveyStatus } from "@prisma/client";
import keyword_extractor from "keyword-extractor";

export const GET = routeHandler(async (_, context) => {
  const { surveyId } = context.params;
  const survey = await prisma.survey.findUniqueOrThrow({
    where: {
      id: surveyId,
    },
  });

  return survey;
});

export const PATCH = routeHandler(async (request, context) => {
  const { surveyId } = context.params;
  const body = await request.json();

  const validation = await Survey.safeParseAsync(body);
  if (!validation.success) {
    throw validation.error;
  }
  const { data } = validation;
  const survey = await prisma.survey.update({
    where: {
      id: surveyId,
    },
    data,
  });

  if (data.status === SurveyStatus.FINISHED) {
    const questions = await prisma.question.findMany({
      where: { surveyId },
      include: { answers: true },
    });

    const questionReportsData = questions.map((question) => {
      let weightedSum = 0;
      let totalSum = 0;
      let answersString = "";

      for (let answer of question.answers) {
        const score = answer.sentimentScore || 0;
        const multiplier = answer.sentimentLabel === "NEGATIVE" ? -1 : 1;

        weightedSum += score * multiplier;
        totalSum += score;
        answersString += answer.answer;
      }

      const globalSentimentScore =
        totalSum !== 0 ? weightedSum / totalSum : 0;

      const keywords = keyword_extractor.extract(answersString, {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true,
      });

      return {
        sentimentScore: +globalSentimentScore.toFixed(5),
        keywords,
        questionId: question.id,
      };
    });

    await prisma.questionReport.createMany({
      data: questionReportsData,
    });
  }
  return survey;
});

export const DELETE = routeHandler(async (_, context) => {
  const { surveyId } = context.params;

  await prisma.survey.delete({
    where: {
      id: surveyId,
    },
  });
});
