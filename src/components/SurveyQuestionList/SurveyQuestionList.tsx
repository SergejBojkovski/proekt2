"use client";
import "@/app/slider.css";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { FaClone, FaTrash } from "react-icons/fa";
import { IoReorderThreeSharp } from "react-icons/io5";
import {
  ReactSortable,
  Sortable,
  SortableEvent,
  Store,
} from "react-sortablejs";
import { QuestionsDTO } from "@/types/QuestionDTO";
import { debounce, isNumber, noop } from "lodash";
import { useRouter } from "next/navigation";
import AddQuestionModal from '@/components/Prompt/Prompt';




interface SurveyQuestionListProps {
  surveyId: string;
}

export default function SurveyQuestionList({
  surveyId,
}: SurveyQuestionListProps) {
  const [questions, setQuestions] = useState<QuestionsDTO["data"]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Specify boolean type for isModalOpen


  const getQuestions = useCallback(async () => {
    const response = await fetch(`/api/surveys/${surveyId}/questions`);
    const { data } = await response.json();
    setQuestions(data);
  }, [surveyId]);

  const handleAddQuestion = async (questionText: string) => {
    await fetch(`/api/surveys/${surveyId}/questions`, {
      method: 'POST',
      body: JSON.stringify({
        text: questionText,
      }),
    });

    getQuestions();
  };

  const handleCloneQuestion = async (questionId: string) => {
    const existingQuestion = questions.find((item) => item.id === questionId);

    if (existingQuestion) {
      const confirmed = window.confirm("Are you sure you want to clone this question?");

      if (confirmed) {
        await fetch(`/api/surveys/${surveyId}/questions`, {
          method: "POST",
          body: JSON.stringify({
            text: existingQuestion.text,
            required: existingQuestion.required,
          }),
        });

        getQuestions();
      }
    }
  };

  const handleSwitchChange = async (questionId: string, newRequired: boolean) => {
    await fetch(`/api/surveys/${surveyId}/questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify({
        required: newRequired,
      }),
    });

    getQuestions();
  };


  const handleQuestionTextChange = debounce(
    async ({ target }: FormEvent<HTMLDivElement>, questionId: string) => {
      const newText = (target as any).innerText;

      await fetch(
        `/api/surveys/${surveyId}/questions/${questionId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            text: newText,
          }),
        }
      );

      getQuestions();
    },
    500,
  );

  const handlePositionChange = async (event: SortableEvent) => {
    if (!isNumber(event.oldIndex)) return;
    const question = questions[event.oldIndex];
    const response = await fetch(
      `/api/surveys/${surveyId}/questions/${question.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          position: event.newIndex,
        }),
      }
    );
    const { data } = await response.json();
    getQuestions();
  };


  const handleDeleteQuestion = async (questionId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this question?");

    if (confirmed) {
      await fetch(`/api/surveys/${surveyId}/questions/${questionId}`, {
        method: "DELETE",
      });

      getQuestions();
    }
  };

  const rt = useRouter()
  const handleRedirectToEdit = () => {
    rt.push(`/dashboard/surveys/${surveyId}/edit`)
  }
  const handleRedirectToResults = () => {
    rt.push(`/dashboard/reports/${surveyId}`)
  }
  const handleRedirectToRecipients = () => {
    rt.push(`/dashboard/surveys/${surveyId}/recipients`)
  }
  const copyParticipationLink = () => {
    let linkName = `http://localhost:3000/surveys/${surveyId}`
    navigator.clipboard.writeText(linkName)
  }
  const copyDashboardLink = () => {
    let linkName = `http://localhost:3000/dashboard/surveys/${surveyId}`
    navigator.clipboard.writeText(linkName)
  }


  useEffect(() => {
    getQuestions();
  }, [getQuestions]);

  return (

    <div>
      <div className="flex justify-end mb-3">
        <button className="text-md border px-3 py-1 rounded-lg bg-white bg-opacity-70 me-4 flex items-center" onClick={handleRedirectToRecipients}>Mail Recipients</button>
        <button className="text-md border px-3 py-1 rounded-lg bg-white bg-opacity-70 me-4 flex items-center" onClick={copyParticipationLink}><FaClone className="mr-2" />Paricipation Link</button>
        <button className="text-md border px-3 py-1 rounded-lg bg-white bg-opacity-70 me-4 flex items-center" onClick={copyDashboardLink}><FaClone className="mr-2" />Dashboard Link</button>
        <button className="text-md border px-3 py-1 rounded-lg bg-white bg-opacity-70 me-4" onClick={handleRedirectToEdit}>Edit Survey Info</button>
        <button className="text-md border px-3 py-1 rounded-lg bg-white bg-opacity-70 me-1" onClick={handleRedirectToResults}>Survey Results</button>
      </div>
      <div className="rounded-sm border border-stroke bg-white shadow-default bg-white bg-opacity-50">
        <div className="grid grid-cols-7 border-t border-stroke py-4.5 px-4 sm:grid-cols-9 md:px-6 2xl:px-7.5">
          <div className="col-span-1">
            <p className="font-medium">Position</p>
          </div>
          <div className="col-span-6 flex">
            <p className="font-medium">Text</p>
          </div>
          <div className="col-span-1 flex">
            <p className="font-medium">Is Required?</p>
          </div>
          <div className="col-span-1"></div>
        </div>
        <ReactSortable list={questions} setList={noop} animation={200} handle=".handle" onEnd={handlePositionChange}>
          {questions.map((item) => (
            <div className="grid grid-cols-7 border-t border-stroke py-4.5 px-4  sm:grid-cols-9 md:px-6 2xl:px-7.5" key={item.id}>
              <div className="col-span-1 flex items-center gap-2 handle cursor-move">
                <IoReorderThreeSharp className="text-2xl" />
                {item.position}
              </div>

              <div className="col-span-6 flex items-center !border-0 !outline-0" contentEditable onInput={(e) => handleQuestionTextChange(e, item.id)} suppressContentEditableWarning={true}>
                {item.text}
              </div>

              <div className="col-span-1">
                <label className="switch">
                  <input type="checkbox" onChange={() => handleSwitchChange(item.id, !item.required)} checked={item.required}></input>
                  <span className="slider"></span>
                </label>
              </div>

              <div className="col-span-1 flex items-center justify-end">
                <button className="hover:text-primary py-2 px-2 rounded text-lg" onClick={() => handleCloneQuestion(item.id)}>
                  <FaClone />
                </button>
                <button className="hover:text-primary py-2 px-2 rounded text-lg" onClick={() => handleDeleteQuestion(item.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </ReactSortable>
      </div>
      <div className="w-full text-center mt-[30px]">
        <button onClick={() => setIsModalOpen(true)} className="w-[300px] h-[60px] bg-blue-500 text-dark px-4 py-2 rounded-md border bg-white bg-opacity-50 text-lg">Add Question</button>
        <AddQuestionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddQuestion}
        />
      </div>
    </div>
  );
}
