'use client';

import { useMemo } from 'react';
import { ApiClient } from '@/lib/api';

export function useApi() {
  return useMemo(() => new ApiClient(), []);
}
