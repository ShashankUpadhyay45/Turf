import { createFileRoute } from "@tanstack/react-router";
import { OwnerSlotsView } from "@/features/owner/OwnerPages";

export const Route = createFileRoute("/owner/slots")({
  head: () => ({
    meta: [
      { title: "Manage Slots — Playo Owner" },
      { name: "description", content: "Control slot availability, block slots, and manage maintenance." },
    ],
  }),
  component: OwnerSlotsPage,
});

function OwnerSlotsPage() {
  return (
    <div className="container-page py-10">
      <OwnerSlotsView />
    </div>
  );
}
