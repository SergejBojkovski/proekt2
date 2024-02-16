import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SentimentScoreMeter from "@/components/SentimentScoreMeter/SentimentScoreMeter";

interface SurveyQuestionReportPageProps {
  params: {
    surveyId: string;
    questionId: string;
  };
}

const getQuestion = async (surveyId: string, questionId: string) => {
  const question = await prisma.question.findFirstOrThrow({
    where: {
      id: questionId,
      surveyId,
    },
    include: {
      report: true,
    },
  });

  return question;
};

const getQuestionData = async (surveyId: string, questionId: string) => {
  const answers = await prisma.questionAnswer.findMany({
    where: {
      question: {
        id: questionId,
        surveyId,
      },
    },
  });

  return answers;
};

export default async function SurveyQuestionReportPage({
  params,
}: SurveyQuestionReportPageProps) {
  const question = await getQuestion(params.surveyId, params.questionId);
  const answers = await getQuestionData(params.surveyId, params.questionId);

  const keywords = (question.report?.keywords || []).splice(0, 10);

  return (
    <div className="container">
      <div className="grid grid-cols-7 gap-10">
        <div className="col-span-5">
          <p className="mb-5">{question.text}</p>
          <table className="w-full table-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Answer
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Score
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody>
              {answers.map((answer) => (
                <tr key={answer.id}>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    {answer.answer}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    {answer.sentimentScore}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    {answer.sentimentLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-span-2">
          <div className="flex flex-col gap-10">
            <Link
              href={`/dashboard/reports/${params.surveyId}`}
              className="bg-primary text-white py-2 px-4 rounded-md text-center"
            >
              Back to questions list
            </Link>
            {question.report ? (
              <div className="border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <h6 className="border-b border-[#eee] dark:border-strokedark p-3 text-center font-medium text-black dark:text-white">
                  Sentiment score
                </h6>
                <SentimentScoreMeter value={question.report.sentimentScore} />
              </div>
            ) : null}
            {keywords.length ? (
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <table className="w-full table-auto">
                  <thead>
                    <tr>
                      <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white border-b border-[#eee]">
                        Keywords
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywords.map((keyword) => (
                      <tr key={keyword}>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark xl:pl-11">
                          {keyword}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}