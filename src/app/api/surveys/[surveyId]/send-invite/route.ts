import prisma from "@/lib/prisma";
import routeHandler from "@/lib/routeHandler";
import nodemailer from "@/lib/nodeMailer";

export const POST = routeHandler(async (request, context) => {
    
    const { surveyId } = context.params;
    const body = await request.json();
    const survey = await prisma.survey.findUniqueOrThrow({
        where: {
            id: surveyId,
        },
    });

    console.log(body.recipient)

    const getSurveyEmailTemplateHtml = () => {
        console.log('Hello mate')
        const surveyUrl = `${process.env.APP_URL}/surveys/${surveyId}`;
        const reportsUrl = `${process.env.APP_URL}/dashboard/reports/${surveyId}`;

        return `<p>You've been invited to participate in our survey "${survey.name}".</p>
      Survey link: <a href="${surveyUrl}">${surveyUrl}</a><br />
      Reports link: <a href="${reportsUrl}">${reportsUrl}</a><br />
      <p>Thank you!</p>`;
    }


    nodemailer.sendMail({
        from: process.env.SMTP_MAIL_FROM,
        to: body.recipient,
        subject: "New Survey Created",
        html: getSurveyEmailTemplateHtml(),
    });

    return survey
});