import prisma from "@/lib/prisma";
import Link from "next/link";
import { FaMagnifyingGlassChart } from "react-icons/fa6";

const getQuestionsForSurvey = async (surveyId: string) => {
  const questions = await prisma.question.findMany({
    where: {
      surveyId,
    },
    include: {
      report: true,
      answers: true,
    },
  });

  const data = questions.map(({ id, text, answers, report }) => ({
    id,
    text,
    answersCount: answers.length,
    score: report?.sentimentScore,
  }));

  return data;
};

interface SurveyQuestionsPageProps {
  params: {
    surveyId: string;
  };
}

export default async function SurveyQuestionsPage({
  params,
}: SurveyQuestionsPageProps) {
  const questions = await getQuestionsForSurvey(params.surveyId);

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mt-[50px]">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Question
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Answers
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Sentiment score
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  {question.text}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  {question.answersCount}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  {question.score || "N/A"}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <Link
                    href={`/dashboard/reports/${params.surveyId}/questions/${question.id}`}
                    className="hover:text-primary"
                  >
                    <FaMagnifyingGlassChart />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}