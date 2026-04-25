import { useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/client';
import useApi from './useApi';

const normalizeCollection = (value = []) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => item && typeof item === 'object');
};

const useEvents = () => {
  const { data, loading, error, refetch, setData } = useApi(
    () => apiClient.get('/admin/events'),
    {
      initialData: [],
      transform: normalizeCollection,
    },
  );

  useEffect(() => {
    if (error) {
      toast.error('Failed to load events');
    }
  }, [error]);

  return {
    data,
    events: data,
    loading,
    error,
    refetch,
    setData,
  };
};

export default useEvents;