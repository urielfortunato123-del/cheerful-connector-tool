import { createFileRoute } from '@tanstack/react-router';
import SSRErrorsDashboard from '@/pages/SSRMonitoring';

export const Route = createFileRoute('/ssr-monitoring')({
  component: SSRErrorsDashboard,
});
