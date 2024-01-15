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
  } else if (request.method === "PUT") {
    // Update logic
    const body = await request.json();
    const validation = await Question.safeParseAsync(body);

    if (!validation.success) {
      throw validation.error;
    }

    const { data } = validation;

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
  } else {
    // unsupported methods
    return {
      error: "Unsupported method",
      details: `Method ${request.method} is not supported for this route.`,
    };
  }
});
