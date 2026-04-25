import { useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/client';
import useApi from './useApi';

const dashboardDefaults = {
  admin: {
    alumni: 0,
    forums: 0,
    jobs: 0,
    upevents: 0,
    events: 0,
    students: 0,
  },
  student: {
    forums: 0,
    jobs: 0,
    upevents: 0,
    applications: 0,
  },
};

const dashboardEndpoints = {
  admin: '/admin/dashboard/counts',
  student: '/student/dashboard/counts',
};

const normalizeCounts = (role) => (counts = {}) => ({
  ...(dashboardDefaults[role] || dashboardDefaults.admin),
  ...counts,
});

const useDashboard = (role = 'admin') => {
  const endpoint = dashboardEndpoints[role] || dashboardEndpoints.admin;
  const { data, loading, error, refetch } = useApi(
    () => apiClient.get(endpoint),
    {
      initialData: dashboardDefaults[role] || dashboardDefaults.admin,
      transform: normalizeCounts(role),
    },
  );

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load ${role} dashboard counts`);
    }
  }, [error, role]);

  return {
    data,
    counts: data,
    loading,
    error,
    refetch,
  };
};

export default useDashboard;