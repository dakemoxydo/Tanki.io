export const logFirebaseError = (error: any, context: string) => {
  console.error(`[Firebase Error] Context: ${context}`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
  });
};
