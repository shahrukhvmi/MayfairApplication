export const normalizeConfirmationInfo = (
  confirmationInfo = [],
  confirmationQuestions = [],
) => {
  if (!Array.isArray(confirmationInfo)) return [];

  return confirmationInfo.map(item => {
    const matchingQuestion = confirmationQuestions.find(
      question => String(question?.id) === String(item?.id),
    );

    const checklist =
      item?.checklist ||
      item?.check_list ||
      matchingQuestion?.checklist ||
      matchingQuestion?.check_list ||
      item?.qsummary ||
      matchingQuestion?.qsummary ||
      item?.question ||
      matchingQuestion?.question ||
      'Patient consent confirmed';

    return {
      ...matchingQuestion,
      ...item,
      checklist,
    };
  });
};

export default normalizeConfirmationInfo;
