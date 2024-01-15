import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import QuestionAnswerSchema from "@/schemas/QuestionAnswer";

export async function POST(request: NextRequest, context: any) {
  const { questionId } = context.params;

  try {
    const answerValidation = QuestionAnswerSchema.safeParse(await request.json());

    if (!answerValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid answer data",
          details: answerValidation.error.errors,
        },
        {
          status: 400,
        }
      );
    }

    const { answer } = answerValidation.data;

    const createdAnswer = await prisma.questionAnswer.create({
      data: {
        questionId,
        answer,
      },
    });

    return NextResponse.json({
      data: createdAnswer,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: NextRequest, context: any) {
  const { questionId } = context.params;

  try {
    const questionAnswers = await prisma.questionAnswer.findMany({
      where: {
        questionId,
      },
    });

    return NextResponse.json({
      data: questionAnswers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
