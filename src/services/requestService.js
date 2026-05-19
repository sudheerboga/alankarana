import { create as fbCreate, update as fbUpdate, remove as fbRemove } from '../firebase/firestore';
import { COLLECTIONS, REQUEST_STATUS } from '../constants';

export const createRequest = async (input) => {
  const doc = {
    description: input.description?.trim() || '',
    category: input.category || null,
    customerName: input.customerName?.trim() || null,
    status: REQUEST_STATUS.PENDING,
    notes: input.notes?.trim() || '',
  };
  const id = await fbCreate(COLLECTIONS.REQUESTED_ITEMS, doc);
  return { id, ...doc };
};

export const updateRequest = async (id, input) => {
  await fbUpdate(COLLECTIONS.REQUESTED_ITEMS, id, input);
};

export const toggleRequestStatus = async (id, currentStatus) => {
  const next = currentStatus === REQUEST_STATUS.PENDING ? REQUEST_STATUS.COMPLETED : REQUEST_STATUS.PENDING;
  await fbUpdate(COLLECTIONS.REQUESTED_ITEMS, id, { status: next });
};

export const deleteRequest = (id) => fbRemove(COLLECTIONS.REQUESTED_ITEMS, id);
