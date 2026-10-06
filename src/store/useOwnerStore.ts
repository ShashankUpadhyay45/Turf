import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { turfs as initialTurfs, mockViolations, mockAuditLogs } from '@/data/turfs';
import type { 
  Turf, 
  ListingApprovalStatus, 
  AvailabilityViolation, 
  AuditLog, 
  AvailabilityAccuracy 
} from '@/types';

interface OwnerState {
  turfs: Turf[];
  violations: AvailabilityViolation[];
  auditLogs: AuditLog[];
  
  // Turf CRUD & Workflow
  addTurf: (turf: Turf) => void;
  updateTurf: (turfId: string, updates: Partial<Turf>) => void;
  deleteTurf: (turfId: string) => void;
  submitTurfForReview: (turfId: string) => void;
  
  // Admin Approval actions
  approveTurf: (turfId: string, adminName: string) => void;
  rejectTurf: (turfId: string, reason: string, adminName: string) => void;
  requestTurfChanges: (turfId: string, notes: string, adminName: string) => void;
  
  // Violations & Negative Marking
  resolveViolation: (violationId: string, resolutionNote: string) => void;
  addViolation: (violation: AvailabilityViolation) => void;
  
  // Getters
  getTurfsByOwner: (ownerId: string) => Turf[];
  getTurfById: (turfId: string) => Turf | undefined;
  getPendingApprovals: () => Turf[];
  getOwnerAccuracy: (ownerId: string) => AvailabilityAccuracy;
}

export const useOwnerStore = create<OwnerState>()(
  persist(
    (set, get) => ({
      turfs: initialTurfs,
      violations: mockViolations,
      auditLogs: mockAuditLogs,

      addTurf: (newTurf: Turf) => {
        set((state) => ({
          turfs: [newTurf, ...state.turfs],
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              actorId: newTurf.ownerId,
              actorName: newTurf.ownerName ?? 'Turf Owner',
              actorRole: 'owner',
              action: 'CREATE_TURF_LISTING',
              targetType: 'TURF',
              targetId: newTurf.id,
              targetName: newTurf.name,
              newValue: newTurf.approvalStatus,
              timestamp: new Date().toISOString(),
              reason: 'New venue registered in owner portal',
            },
            ...state.auditLogs,
          ],
        }));
      },

      updateTurf: (turfId: string, updates: Partial<Turf>) => {
        set((state) => ({
          turfs: state.turfs.map((t) => (t.id === turfId ? { ...t, ...updates } : t)),
        }));
      },

      deleteTurf: (turfId: string) => {
        set((state) => ({
          turfs: state.turfs.filter((t) => t.id !== turfId),
        }));
      },

      submitTurfForReview: (turfId: string) => {
        set((state) => ({
          turfs: state.turfs.map((t) =>
            t.id === turfId
              ? {
                  ...t,
                  approvalStatus: 'PENDING_REVIEW' as ListingApprovalStatus,
                  submittedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      approveTurf: (turfId: string, adminName: string) => {
        const target = get().turfs.find((t) => t.id === turfId);
        set((state) => ({
          turfs: state.turfs.map((t) =>
            t.id === turfId
              ? {
                  ...t,
                  approvalStatus: 'APPROVED' as ListingApprovalStatus,
                  approvedAt: new Date().toISOString(),
                  available: true,
                  verified: true,
                  verificationStatus: 'VERIFIED',
                }
              : t
          ),
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              actorId: 'admin-1',
              actorName: adminName,
              actorRole: 'admin',
              action: 'APPROVE_TURF_LISTING',
              targetType: 'TURF',
              targetId: turfId,
              targetName: target?.name ?? 'Sports Turf',
              oldValue: target?.approvalStatus,
              newValue: 'APPROVED',
              timestamp: new Date().toISOString(),
              reason: 'All documentation and pitch inspections verified successfully.',
            },
            ...state.auditLogs,
          ],
        }));
      },

      rejectTurf: (turfId: string, reason: string, adminName: string) => {
        const target = get().turfs.find((t) => t.id === turfId);
        set((state) => ({
          turfs: state.turfs.map((t) =>
            t.id === turfId
              ? {
                  ...t,
                  approvalStatus: 'REJECTED' as ListingApprovalStatus,
                  rejectionReason: reason,
                  available: false,
                }
              : t
          ),
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              actorId: 'admin-1',
              actorName: adminName,
              actorRole: 'admin',
              action: 'REJECT_TURF_LISTING',
              targetType: 'TURF',
              targetId: turfId,
              targetName: target?.name ?? 'Sports Turf',
              oldValue: target?.approvalStatus,
              newValue: 'REJECTED',
              timestamp: new Date().toISOString(),
              reason,
            },
            ...state.auditLogs,
          ],
        }));
      },

      requestTurfChanges: (turfId: string, notes: string, adminName: string) => {
        const target = get().turfs.find((t) => t.id === turfId);
        set((state) => ({
          turfs: state.turfs.map((t) =>
            t.id === turfId
              ? {
                  ...t,
                  approvalStatus: 'CHANGES_REQUESTED' as ListingApprovalStatus,
                  changesRequestedNote: notes,
                  available: false,
                }
              : t
          ),
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              actorId: 'admin-1',
              actorName: adminName,
              actorRole: 'admin',
              action: 'REQUEST_CHANGES_TURF',
              targetType: 'TURF',
              targetId: turfId,
              targetName: target?.name ?? 'Sports Turf',
              oldValue: target?.approvalStatus,
              newValue: 'CHANGES_REQUESTED',
              timestamp: new Date().toISOString(),
              reason: notes,
            },
            ...state.auditLogs,
          ],
        }));
      },

      resolveViolation: (violationId: string, resolutionNote: string) => {
        set((state) => ({
          violations: state.violations.map((v) =>
            v.id === violationId
              ? {
                  ...v,
                  status: 'RESOLVED',
                  resolvedAt: new Date().toISOString(),
                  resolutionNote,
                }
              : v
          ),
        }));
      },

      addViolation: (violation: AvailabilityViolation) => {
        set((state) => ({
          violations: [violation, ...state.violations],
        }));
      },

      getTurfsByOwner: (ownerId: string) => {
        return get().turfs.filter((t) => t.ownerId === ownerId);
      },

      getTurfById: (turfId: string) => {
        return get().turfs.find((t) => t.id === turfId);
      },

      getPendingApprovals: () => {
        return get().turfs.filter((t) => t.approvalStatus !== 'APPROVED');
      },

      getOwnerAccuracy: (ownerId: string) => {
        const ownerViolations = get().violations.filter((v) => v.ownerId === ownerId);
        const negativePointsTotal = ownerViolations.reduce((acc, cur) => acc + cur.negativePoints, 0);
        const score = Math.max(50, 100 - negativePointsTotal);

        return {
          ownerId,
          accuracyScore: score,
          totalSlotsEvaluated: 140,
          accurateSlotsCount: 138,
          violationsCount: ownerViolations.length,
          activeWarningsCount: ownerViolations.filter((v) => v.status === 'WARNING_ISSUED').length,
          negativePointsTotal,
          riskLevel: negativePointsTotal >= 30 ? 'CRITICAL' : negativePointsTotal >= 15 ? 'HIGH' : negativePointsTotal >= 5 ? 'ELEVATED' : 'LOW',
          suspensionThreshold: 50,
          lastAuditedAt: new Date().toISOString(),
        };
      },
    }),
    {
      name: 'playo-owner-store-v2',
    }
  )
);
