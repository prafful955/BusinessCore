// Set this to your backend gateway URL when the employee API is available.
const API_BASE_URL = 'http://localhost:8080/api';

export async function apiRequest<T>(zPathP: string, oOptionsP: RequestInit = {}): Promise<T> {
  const oResponseL = await fetch(`${API_BASE_URL}${zPathP}`, {
    ...oOptionsP,
    headers: { 'Content-Type': 'application/json', ...oOptionsP.headers },
  });
  if (!oResponseL.ok) {
    const body = (await oResponseL.json().catch(() => null)) as { message?: string } | null;
    throw new Error(
      body?.message ||
        'Request failed (' + oResponseL.status + '). Please check that the backend API is running.'
    );
  }
  if (oResponseL.status === 204) return undefined as T;
  return oResponseL.json() as Promise<T>;
}
