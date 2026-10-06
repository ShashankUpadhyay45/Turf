import { createFileRoute, Outlet } from '@tanstack/react-router';
import { RouteGuard } from '@/components/RouteGuard';

export const Route = createFileRoute('/owner')({
  component: OwnerLayout,
});

function OwnerLayout() {
  return (
    <RouteGuard allowedRoles={['owner', 'admin']}>
      <Outlet />
    </RouteGuard>
  );
}
