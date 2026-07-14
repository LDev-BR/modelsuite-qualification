import API from './axios';

export const updateTalentProfile = (profile) => API.put('/auth/profile', profile);
