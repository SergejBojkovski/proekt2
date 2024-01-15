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

  // Find the last question in the survey
  const lastQuestion = await prisma.question.findFirst({
    where: {
      surveyId,
    },
    orderBy: {
      position: 'desc',
    },
  });

  // Calculate the new position for the incoming question
  const newPosition = lastQuestion ? lastQuestion.position + 1 : 0;

  // Create the new question with the calculated position
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

export const DELETE = routeHandler(async (request, context) => {
  const { surveyId, questionId } = context.params;

  if (request.method === "DELETE") {
    // Retrieve the existing question to get its position
    const existingQuestion = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!existingQuestion) {
      throw new Error(`Question with id ${questionId} not found.`);
    }

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

    // Update positions of remaining questions to align
    await prisma.question.updateMany({
      where: {
        surveyId,
        position: {
          gte: existingQuestion.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
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
