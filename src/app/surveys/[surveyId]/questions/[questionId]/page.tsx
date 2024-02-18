"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { FormEventHandler } from "react";
import { QuestionDTO, QuestionsDTO } from "@/types/QuestionDTO";
import { useRouter } from "next/navigation";



export default function PublicSurveyQuestionPage() {
  const router = useRouter();
  const { surveyId, questionId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionsDTO["data"]>([]);
  const [questionData, setQuestionData] = useState<QuestionDTO["data"]>();
  const currentQuestionId = Array.isArray(questionId) ? questionId[0] : questionId;
  const [transform, setTransform] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getQuestions = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/questions`);
      const data: QuestionsDTO = await response.json();
      const sortedQuestions = data.data
        .filter(question => question.position !== undefined)
        .sort((a, b) => a.position! - b.position!);

      setQuestions(sortedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const getQuestionData = async (qid: string) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/questions/${qid}`);
      const data: QuestionDTO = await response.json();
      setQuestionData(data.data);
    } catch (error) {
      console.error("Error fetching question data:", error);
    }
  };

  useEffect(() => {
    getQuestions();
  }, [surveyId]);

  useEffect(() => {
    if (questionId && questions.length > 0) {
      const index = questions.findIndex(q => q.id === questionId);
      if (index > -1) {
        setCurrentQuestionIndex(index);
      }
    }
  }, [questionId, questions]);

  useEffect(() => {
    if (currentQuestionId) {
      getQuestionData(currentQuestionId);
    }
  }, [currentQuestionId]);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const answer = formData.get("answer") as string;

    const answerEndpoint = `/api/surveys/${surveyId}/questions/${currentQuestionId}/answers`;

    try {
      const response = await fetch(answerEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer }),
      });

      if (response.ok) {
        if (currentQuestionIndex < questions.length - 1) {
          const nextQuestionId = questions[currentQuestionIndex + 1].id;
          router.push(`/surveys/${surveyId}/questions/${nextQuestionId}`);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          console.log("Survey completed");
          router.push(`/surveys/completed`);
        }
      } else {
        console.error("Failed to submit answer:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const goNext = () => {
    setTransform(prevTransform => {
      const newIndex = currentQuestionIndex + 1;
      if (newIndex < questions.length && sliderRef.current) {
        setCurrentQuestionIndex(newIndex);
        const newTransform = -69 * newIndex;
        return newTransform;
      } else {
        // If reached the end or sliderRef is null, handle accordingly
        return prevTransform;
      }
    });
  };

  const goPrev = () => {
    setTransform(prevTransform => {
      const newIndex = currentQuestionIndex - 1;
      if (newIndex >= 0 && sliderRef.current) {
        setCurrentQuestionIndex(newIndex);
        const newTransform = -69 * newIndex;
        return newTransform;
      } else {
        // If reached the beginning or sliderRef is null, handle accordingly
        return prevTransform;
      }
    });
  };

  console.log(questions)
  return (
    <div className="h-screen bgimage">
      <div>
        <div className="top-0 w-full h-full py-20 sm:py-8 px-4">
          <div className="flex">
            <div className=" mx-auto relative flex items-center justify-center ">
              <button aria-label="slide backward" className="mt-[100px] absolute z-30 left-0 ml-10 focus:outline-none focus:bg-gray-400 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 cursor-pointer" id="prev" onClick={goPrev}>
                <svg className="dark:text-gray-900" width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="w-[600px] h-full mx-[160px] overflow-x-hidden overflow-y-hidden" style={{ transform: `translateX(${transform}px)` }} ref={sliderRef}>
                <div id="slider" className=" h-full flex lg:gap-4 md:gap-4 gap-10 items-center justify-start transition ease-out duration-500">
                  {questions.map((_, index) => (
                    <div key={index} className="flex w-full sm:w-auto">
                      <div className={`flex rounded-full bg-[#999999] w-[60px] h-[60px] justify-center items-center ${currentQuestionIndex === index ? 'bg-black' : 'bg-[#999999]'}`}>
                        <h3 className="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900 p-[20px]">{index + 1}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button aria-label="slide forward" className="mt-[100px] absolute z-30 right-0 mr-10 focus:outline-none focus:bg-gray-400 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400" id="next" onClick={goNext}>
                <svg className="dark:text-gray-900" width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 w-full mb-30">
        <form onSubmit={handleFormSubmit}>
          <h1 className="text-3xl font-bold text-center" style={{ color: "black" }}>{questionData?.text}</h1>
          <div className="flex justify-center mb-10 mt-20">
            <div className="w-2/3">
              <textarea name="answer" rows={6} className="w-full border-2 rounded-md text-2xl py-3 px-3 bg-white bg-opacity-60" style={{ resize: "none" }} required={questionData?.required || false} placeholder="Your Answer Here"></textarea>
            </div>
          </div>
          <div className="text-center">
            <button type="submit" className="px-4 py-2 text-white font-bold rounded-md uppercase" style={{ backgroundColor: "#d9d9d9", color: "black" }}>
              Next Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}