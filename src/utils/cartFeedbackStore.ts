let pendingCartSuccessMessage: string | null = null;

export const cartFeedbackStore = {
  setSuccessMessage(message: string) {
    pendingCartSuccessMessage = message;
  },

  consumeSuccessMessage() {
    const message = pendingCartSuccessMessage;
    pendingCartSuccessMessage = null;
    return message;
  },
};