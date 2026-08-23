export const getReadableErrorMessage = (error: any): string => {
  const code = error?.code || error?.message || '';

  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) {
    return 'Невалиден имейл или парола.';
  }
  if (code.includes('auth/user-not-found')) {
    return 'Няма намерен профил с този имейл.';
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'Вече съществува профил с този имейл.';
  }
  if (code.includes('auth/weak-password')) {
    return 'Паролата трябва да съдържа поне 6 символа.';
  }
  if (code.includes('auth/network-request-failed')) {
    return 'Проблем с интернет връзката.';
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Твърде много опити. Опитайте отново по-късно.';
  }

  return error?.message || 'Възникна непредвидена грешка.';
};