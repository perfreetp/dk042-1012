export type HelperType = 'express' | 'care' | 'move' | 'tool' | 'run';
export type UrgentLevel = 'high' | 'medium' | 'low';
export type HelperStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type RewardType = 'free' | 'money' | 'gift' | 'exchange';

export interface HelperTypeMeta {
  key: HelperType;
  label: string;
  color: string;
  bgColor: string;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  building: string;
  unit: string;
  phone: string;
  creditScore: number;
  helpCount: number;
  helpedCount: number;
}

export interface HelperRequest {
  id: string;
  type: HelperType;
  title: string;
  description: string;
  urgentLevel: UrgentLevel;
  status: HelperStatus;
  publisherId: string;
  publisher: UserInfo;
  building: string;
  unit: string;
  addressDetail: string;
  distance: number;
  startTime: string;
  endTime: string;
  rewardType: RewardType;
  rewardDetail: string;
  maxResponders: number;
  responders: UserInfo[];
  acceptedUserId?: string;
  messages: HelperMessage[];
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface HelperMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  isSystem?: boolean;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'activity' | 'warning';
  publisher: string;
  isTop: boolean;
  createdAt: string;
}

export interface ThanksItem {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  toUserName: string;
  toUserAvatar: string;
  helperRequestId: string;
  helperTitle: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface AddressItem {
  id: string;
  building: string;
  unit: string;
  room: string;
  detail: string;
  isDefault: boolean;
}

export interface BlacklistItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  reason: string;
  createdAt: string;
}

export interface CreditRecord {
  id: string;
  type: 'plus' | 'minus';
  score: number;
  reason: string;
  relatedRequestId?: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'user' | 'request';
  reason: string;
  detail: string;
  images: string[];
  status: 'pending' | 'processed' | 'rejected';
  createdAt: string;
}
