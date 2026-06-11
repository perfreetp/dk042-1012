import { create } from 'zustand';
import type {
  HelperRequest,
  HelperMessage,
  AddressItem,
  ReportItem,
  UserInfo,
  AuditLog,
  ReportProcessHistory
} from '@/types';
import { mockHelpers } from '@/data/helpers';
import { mockAddresses, mockBlacklist, currentUser, adminUser } from '@/data/notices';
import { generateId } from '@/utils';

interface AppState {
  helpers: HelperRequest[];
  addresses: AddressItem[];
  reports: ReportItem[];
  currentUser: UserInfo;
  isAdmin: boolean;

  addHelper: (helper: HelperRequest) => void;
  updateHelper: (id: string, patch: Partial<HelperRequest>) => void;
  addResponder: (helperId: string, user: UserInfo) => void;
  acceptResponder: (helperId: string, userId: string) => void;
  startHelper: (helperId: string) => void;
  completeHelper: (helperId: string) => void;
  cancelHelper: (helperId: string, reason: string) => void;
  addMessage: (helperId: string, msg: HelperMessage) => void;
  approveHelper: (helperId: string) => void;
  rejectHelper: (helperId: string, reason: string) => void;

  addAddress: (addr: Omit<AddressItem, 'id'>) => void;
  updateAddress: (id: string, patch: Partial<AddressItem>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => AddressItem | undefined;

  addReport: (report: Omit<ReportItem, 'id' | 'status' | 'createdAt' | 'processHistory'>) => void;
  processReport: (id: string, approved: boolean, handleNote?: string) => void;
  reopenReport: (id: string, handleNote?: string) => void;
  reopenHelper: (helperId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  helpers: mockHelpers.map((h) => ({ ...h, auditLogs: h.auditLogs || [] })),
  addresses: [...mockAddresses],
  reports: [],
  currentUser,
  isAdmin: true,

  addHelper: (helper) =>
    set((state) => ({
      helpers: [helper, ...state.helpers]
    })),

  updateHelper: (id, patch) =>
    set((state) => ({
      helpers: state.helpers.map((h) =>
        h.id === id ? { ...h, ...patch, updatedAt: new Date().toISOString() } : h
      )
    })),

  addResponder: (helperId, user) =>
    set((state) => ({
      helpers: state.helpers.map((h) =>
        h.id === helperId && !h.responders.some((r) => r.id === user.id)
          ? {
              ...h,
              responders: [...h.responders, user],
              updatedAt: new Date().toISOString()
            }
          : h
      )
    })),

  acceptResponder: (helperId, userId) =>
    set((state) => ({
      helpers: state.helpers.map((h) =>
        h.id === helperId
          ? {
              ...h,
              status: 'accepted',
              acceptedUserId: userId,
              updatedAt: new Date().toISOString()
            }
          : h
      )
    })),

  startHelper: (helperId) =>
    set((state) => ({
      helpers: state.helpers.map((h) =>
        h.id === helperId
          ? { ...h, status: 'in_progress', updatedAt: new Date().toISOString() }
          : h
      )
    })),

  completeHelper: (helperId) =>
    set((state) => ({
      helpers: state.helpers.map((h) =>
        h.id === helperId
          ? {
              ...h,
              status: 'completed',
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : h
      )
    })),

  cancelHelper: (helperId, reason) =>
    set((state) => ({
      helpers: state.helpers.map((h) =>
        h.id === helperId
          ? {
              ...h,
              status: 'cancelled',
              cancelReason: reason,
              updatedAt: new Date().toISOString()
            }
          : h
      )
    })),

  addMessage: (helperId, msg) =>
    set((state) => ({
      helpers: state.helpers.map((h) =>
        h.id === helperId
          ? {
              ...h,
              messages: [...h.messages, msg],
              updatedAt: new Date().toISOString()
            }
          : h
      )
    })),

  approveHelper: (helperId: string) =>
    set((state) => ({
      helpers: state.helpers.map((h) => {
        if (h.id !== helperId) return h;
        const log: AuditLog = {
          id: generateId(),
          operatorId: adminUser.id,
          operatorName: adminUser.name,
          action: 'approve',
          timestamp: new Date().toISOString()
        };
        return {
          ...h,
          status: 'pending',
          updatedAt: new Date().toISOString(),
          auditLogs: [...(h.auditLogs || []), log]
        };
      })
    })),

  rejectHelper: (helperId, reason) =>
    set((state) => ({
      helpers: state.helpers.map((h) => {
        if (h.id !== helperId) return h;
        const log: AuditLog = {
          id: generateId(),
          operatorId: adminUser.id,
          operatorName: adminUser.name,
          action: 'reject',
          note: reason,
          timestamp: new Date().toISOString()
        };
        return {
          ...h,
          status: 'cancelled',
          cancelReason: `管理员驳回：${reason}`,
          updatedAt: new Date().toISOString(),
          auditLogs: [...(h.auditLogs || []), log]
        };
      })
    })),

  reopenHelper: (helperId) =>
    set((state) => ({
      helpers: state.helpers.map((h) => {
        if (h.id !== helperId) return h;
        const log: AuditLog = {
          id: generateId(),
          operatorId: adminUser.id,
          operatorName: adminUser.name,
          action: 'reopen',
          timestamp: new Date().toISOString()
        };
        return {
          ...h,
          status: 'pending_review',
          cancelReason: undefined,
          updatedAt: new Date().toISOString(),
          auditLogs: [...(h.auditLogs || []), log]
        };
      })
    })),

  addAddress: (addr) =>
    set((state) => {
      const newAddr = { ...addr, id: generateId() };
      if (newAddr.isDefault) {
        return {
          addresses: [
            newAddr,
            ...state.addresses.map((a) => ({ ...a, isDefault: false }))
          ]
        };
      }
      return { addresses: [...state.addresses, newAddr] };
    }),

  updateAddress: (id, patch) =>
    set((state) => {
      const next = state.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a));
      if (patch.isDefault) {
        return { addresses: next.map((a) => ({ ...a, isDefault: a.id === id })) };
      }
      return { addresses: next };
    }),

  deleteAddress: (id) =>
    set((state) => ({
      addresses: state.addresses.filter((a) => a.id !== id)
    })),

  setDefaultAddress: (id) =>
    set((state) => ({
      addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id }))
    })),

  getDefaultAddress: () => {
    const state = get();
    return state.addresses.find((a) => a.isDefault) || state.addresses[0];
  },

  addReport: (report) =>
    set((state) => ({
      reports: [
        {
          ...report,
          id: generateId(),
          status: 'pending',
          processHistory: [],
          createdAt: new Date().toISOString()
        },
        ...state.reports
      ]
    })),

  processReport: (id, approved, handleNote) =>
    set((state) => ({
      reports: state.reports.map((r) => {
        if (r.id !== id) return r;
        const history: ReportProcessHistory = {
          id: generateId(),
          operatorId: adminUser.id,
          operatorName: adminUser.name,
          action: approved ? 'process' : 'reject',
          resultStatus: approved ? 'processed' : 'rejected',
          note: handleNote,
          timestamp: new Date().toISOString()
        };
        return {
          ...r,
          status: approved ? 'processed' : 'rejected',
          handleNote: handleNote || r.handleNote,
          processHistory: [...(r.processHistory || []), history]
        };
      })
    })),

  reopenReport: (id, handleNote) =>
    set((state) => ({
      reports: state.reports.map((r) => {
        if (r.id !== id) return r;
        const history: ReportProcessHistory = {
          id: generateId(),
          operatorId: adminUser.id,
          operatorName: adminUser.name,
          action: 'reopen',
          resultStatus: 'pending',
          note: handleNote,
          timestamp: new Date().toISOString()
        };
        return {
          ...r,
          status: 'pending',
          handleNote: handleNote || r.handleNote,
          processHistory: [...(r.processHistory || []), history]
        };
      })
    }))
}));
