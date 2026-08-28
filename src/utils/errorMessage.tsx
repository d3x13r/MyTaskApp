export const getReadableErrorMessage = (
  error: any,
  t: (key: string) => string
): string => {
  const code = error?.code || error?.message || '';

  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) {
    return t('errors.invalidCredential');
  }
  if (code.includes('auth/user-not-found')) {
    return t('errors.userNotFound');
  }
  if (code.includes('auth/email-already-in-use')) {
    return t('errors.emailInUse');
  }
  if (code.includes('auth/weak-password')) {
    return t('errors.weakPassword');
  }
  if (code.includes('auth/network-request-failed')) {
    return t('errors.networkError');
  }
  if (code.includes('auth/too-many-requests')) {
    return t('errors.tooManyRequests');
  }

  return error?.message || t('errors.generic');
};
