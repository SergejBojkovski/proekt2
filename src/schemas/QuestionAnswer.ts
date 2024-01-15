import {z} from "zod";

const QuestionAnswerSchema = z.object({
    answer: z.string(),
});

export default QuestionAnswerSchema;