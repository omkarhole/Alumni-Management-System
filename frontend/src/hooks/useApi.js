import { useCallback, useEffect, useRef, useState } from 'react';

const normalizeApiData = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeApiData(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((accumulator, [key, entryValue]) => {
      if (key === '_id') {
        accumulator._id = entryValue;
        accumulator.id = entryValue;
        return accumulator;
      }

      accumulator[key] = normalizeApiData(entryValue);
      return accumulator;
    }, {});
  }

  return value;
};

const useApi = (
  fetcher,
  {
    initialData = null,
    transform = normalizeApiData,
    immediate = true,
  } = {},
) => {
  const fetcherRef = useRef(fetcher);
  const transformRef = useRef(transform);
  const mountedRef = useRef(true);

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(immediate));
  const [error, setError] = useState(null);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const execute = useCallback(async () => {
    if (!mountedRef.current) {
      return undefined;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetcherRef.current();
      const rawData = response?.data ?? response;
      const normalizedData = transformRef.current(rawData);

      if (mountedRef.current) {
        setData(normalizedData);
      }

      return normalizedData;
    } catch (requestError) {
      if (mountedRef.current) {
        setError(requestError);
      }

      return undefined;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      void execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    setData,
  };
};

export default useApi;
export { normalizeApiData };