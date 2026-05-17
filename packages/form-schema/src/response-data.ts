export interface SubmissionAnswer {
  fieldId: string
  value: string | string[] | number | null
}

export interface Submission {
  submissionId: string
  formId: string
  submittedAt: string
  source: 'online' | string
  answers: SubmissionAnswer[]
}

export type ResponseData = Submission[]
