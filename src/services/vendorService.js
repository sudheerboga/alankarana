import { create as fbCreate, update as fbUpdate, remove as fbRemove } from '../firebase/firestore';
import { COLLECTIONS } from '../constants';

const buildVendorDoc = (input) => ({
  name: input.name?.trim() || '',
  category: input.category || 'misc',
  phone: input.phone?.trim() || '',
  address: input.address?.trim() || '',
  notes: input.notes?.trim() || '',
});

export const createVendor = async (input) => {
  const doc = buildVendorDoc(input);
  const id = await fbCreate(COLLECTIONS.VENDORS, doc);
  return { id, ...doc };
};

export const updateVendor = async (id, input) => {
  const doc = buildVendorDoc(input);
  await fbUpdate(COLLECTIONS.VENDORS, id, doc);
  return { id, ...doc };
};

export const deleteVendor = (id) => fbRemove(COLLECTIONS.VENDORS, id);
