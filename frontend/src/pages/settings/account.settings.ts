export type AccountSettings = { name: string; photo: string };
export function readAccountSettings(zEmailP: string): AccountSettings {
  const oDefaultL = {
    name: zEmailP
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (zLetterP) => zLetterP.toUpperCase()),
    photo: '',
  };
  try {
    const oStoredL = JSON.parse(localStorage.getItem('erp-account-' + zEmailP) || 'null');
    return {
      name:
        typeof oStoredL?.name === 'string' && oStoredL.name.trim() ? oStoredL.name : oDefaultL.name,
      photo:
        typeof oStoredL?.photo === 'string' && oStoredL.photo.startsWith('data:image/')
          ? oStoredL.photo
          : '',
    };
  } catch {
    return oDefaultL;
  }
}
