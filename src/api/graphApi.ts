const BASE_URL = '/api';

export interface ApiUser {
  id: string;
  name: string;
  role?: 'general' | 'student' | 'company';
}

export async function createUserApi(
  id: string,
  name: string,
  role: 'general' | 'student' | 'company' = 'general'
): Promise<ApiUser> {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, role })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUserApi(id: string): Promise<ApiUser> {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getFriendsApi(userId: string): Promise<ApiUser[]> {
  const res = await fetch(`${BASE_URL}/users/${userId}/friends`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPendingRequestsApi(userId: string): Promise<ApiUser[]> {
  const res = await fetch(`${BASE_URL}/users/${userId}/requests`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendFriendRequestApi(fromId: string, toId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/friend-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromId, toId })
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function acceptFriendRequestApi(fromId: string, toId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/friend-accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromId, toId })
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function declineFriendRequestApi(fromId: string, toId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/friend-decline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromId, toId })
  });
  if (!res.ok) throw new Error(await res.text());
} 