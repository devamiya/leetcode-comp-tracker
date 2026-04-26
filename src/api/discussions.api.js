/**
 * API functions for community discussions.
 */
import api from './client';

/**
 * Fetch all discussion threads.
 */
export async function fetchDiscussions() {
  const { data } = await api.get('/discussions');
  return data;
}

/**
 * Create a new discussion thread.
 */
export async function createThread(threadData) {
  const { data } = await api.post('/discussions', threadData);
  return data;
}

/**
 * Add a comment to a discussion thread.
 */
export async function addComment(threadId, commentData) {
  const { data } = await api.post(`/discussions/${threadId}/comments`, commentData);
  return data;
}
