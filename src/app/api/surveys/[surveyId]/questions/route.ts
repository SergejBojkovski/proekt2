import routeHandler from "@/lib/routeHandler";
import prisma from "@/lib/prisma";
import Question from "@/schemas/Question";

export const POST = routeHandler(async (request, context) => {
  const { surveyId } = context.params;
  const body = await request.json();

  // Validate the request body using the Question schema
  const validation = await Question.safeParseAsync(body);
  if (!validation.success) {
    throw validation.error;
  }

  const { data } = validation;

  // Get the current survey questions count
  const surveyQuestionsCount = await prisma.question.count({
    where: {
      surveyId,
    },
  });

  // Increment the position for the new question
  const newPosition = surveyQuestionsCount;

  // Create the new question with the incremented position
  const createdQuestion = await prisma.question.create({
    data: {
      ...data,
      position: newPosition,
      survey: {
        connect: {
          id: surveyId,
        },
      },
    },
  });

  return createdQuestion;
});
