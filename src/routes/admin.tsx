import { createFileRoute, Outlet } from '@tanstack/react-router';
import { RouteGuard } from '@/components/RouteGuard';

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RouteGuard allowedRoles={['admin']}>
      <Outlet />
    </RouteGuard>
  );
}
