export type SubmissionStatus = 'sending' | 'success' | 'error' | null;

export type ChangeEventTarget = HTMLInputElement | HTMLTextAreaElement;

export type FormErrors = {
    email?: string;
};

export type ContactContent = {
  title: string;
  form: {
    placeholderEmail: string;
    placeholderMessage: string;
    buttonText: string;
    buttonSending: string;
  };
  result: {
    success: string;
    error: string;
  };
};