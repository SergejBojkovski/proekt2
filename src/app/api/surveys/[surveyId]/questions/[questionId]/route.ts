import routeHandler from "@/lib/routeHandler";
import prisma from "@/lib/prisma";
import Question from "@/schemas/Question";

export const DELETE = routeHandler(async (request, context) => {
  const { surveyId, questionId } = context.params;

  if (request.method === "DELETE") {
    // Delete logic
    const response = await prisma.survey.update({
      where: {
        id: surveyId,
      },
      data: {
        questions: {
          delete: {
            id: questionId,
          },
        },
      },
      include: {
        questions: true,
      },
    });

    return response;
  } else {
    // unsupported methods
    return {
      error: "Unsupported method",
      details: `Method ${request.method} is not supported for this route.`,
    };
  }
});

export const PUT = routeHandler(async (request, context) => {
  const { surveyId, questionId } = context.params;
  const body = await request.json();
  const validation = await Question.safeParseAsync(body);

  if (!validation.success) {
    throw validation.error;
  }

  const { data } = validation;

  // Handle position update
  if (data.position !== undefined) {
    // Retrieve the existing question
    const existingQuestion = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!existingQuestion) {
      throw new Error(`Question with id ${questionId} not found.`);
    }

    // Calculate the difference in positions
    const positionDifference = data.position - existingQuestion.position;

    // Update the positions of questions
    await prisma.question.updateMany({
      where: {
        surveyId,
        position: {
          gte: Math.min(existingQuestion.position, data.position),
          lte: Math.max(existingQuestion.position, data.position),
        },
      },
      data: {
        position: {
          increment: positionDifference,
        },
      },
    });
  }

  const updatedSurvey = await prisma.survey.update({
    where: {
      id: surveyId,
    },
    data: {
      questions: {
        update: [
          {
            where: {
              id: questionId,
            },
            data,
          },
        ],
      },
    },
    include: {
      questions: true,
    },
  });

  return updatedSurvey;
});
