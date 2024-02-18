import MailRecipients from "@/components/MailRecipients/MailRecipients";

type SurveyEditPageParams = {
  params: {
    surveyId: string;
  };
};

export default async function SurveyEditPage({ 
  params: { surveyId },
}: SurveyEditPageParams) {
  return (
    <div className="flex flex-col gap-5">
      <MailRecipients surveyId={surveyId}/>
    </div>
  );
}
