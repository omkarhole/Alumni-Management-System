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

const useJobs = () => {
  const { data, loading, error, refetch, setData } = useApi(
    () => apiClient.get('/admin/jobs'),
    {
      initialData: [],
      transform: normalizeCollection,
    },
  );

  useEffect(() => {
    if (error) {
      toast.error('Failed to load jobs');
    }
  }, [error]);

  return {
    data,
    jobs: data,
    loading,
    error,
    refetch,
    setData,
  };
};

export default useJobs;