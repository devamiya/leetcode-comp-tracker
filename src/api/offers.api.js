/**
 * API functions for compensation offers.
 */
import api from './client';

/**
 * Fetch all compensation data (offers + summary + companies + roles).
 * This is the main data endpoint.
 */
export async function fetchAllData() {
  const { data } = await api.get('/data');
  return data;
}

/**
 * Submit a new user-contributed offer.
 */
export async function submitOffer(offerData) {
  const { data } = await api.post('/offers', offerData);
  return data;
}
