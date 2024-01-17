import routeHandler from "@/lib/routeHandler";
import prisma from "@/lib/prisma";
import Question from "@/schemas/Question";

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

    // Get remaining questions and update positions starting from 0
    const remainingQuestions = await prisma.question.findMany({
      where: {
        surveyId,
      },
      orderBy: {
        position: 'asc',
      },
    });

    for (let i = 0; i < remainingQuestions.length; i++) {
      await prisma.question.update({
        where: {
          id: remainingQuestions[i].id,
        },
        data: {
          position: i,
        },
      });
    }

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

  // Retrieve the existing question to get its position
  const existingQuestion = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });

  if (!existingQuestion) {
    throw new Error(`Question with id ${questionId} not found.`);
  }

  // If the position is changing, update positions accordingly
  if (data.position !== undefined && data.position !== existingQuestion.position) {
    const newPosition = data.position;

    // Retrieve all questions for the survey
    const allQuestions = await prisma.question.findMany({
      where: {
        surveyId,
      },
      orderBy: {
        position: 'asc',
      },
    });

    // Ensure the new position is within bounds
    const updatedPosition = Math.max(0, Math.min(newPosition, allQuestions.length - 1));

    // Update positions based on the new position
    for (let i = 0; i < allQuestions.length; i++) {
      const currentPosition = allQuestions[i].position;

      if (currentPosition === existingQuestion.position) {
        // Update the position of the question being modified
        await prisma.question.update({
          where: {
            id: questionId,
          },
          data: {
            position: updatedPosition,
          },
        });
      } else if (
        currentPosition >= Math.min(existingQuestion.position, updatedPosition) &&
        currentPosition <= Math.max(existingQuestion.position, updatedPosition)
      ) {
        // Shift the positions of other questions
        await prisma.question.update({
          where: {
            id: allQuestions[i].id,
          },
          data: {
            position: currentPosition + (newPosition > existingQuestion.position ? -1 : 1),
          },
        });
      }
    }
  }

  // Update the question's text, required properties, and position
  const updatedQuestion = await prisma.question.update({
    where: {
      id: questionId,
    },
    data: {
      text: data.text,
      required: data.required,
      position: data.position,
    },
  });

  return updatedQuestion;
});
