import dayjs from 'dayjs';
import type { HelperType, UrgentLevel, HelperStatus, RewardType } from '@/types';

export const helperTypeList: { key: HelperType; label: string; color: string; bgColor: string }[] = [
  { key: 'express', label: '代取快递', color: '#4C9AFF', bgColor: '#E8F3FF' },
  { key: 'care', label: '短时看护', color: '#722ED1', bgColor: '#F3E8FF' },
  { key: 'move', label: '搬运协助', color: '#F53F3F', bgColor: '#FFE8E8' },
  { key: 'tool', label: '借用工具', color: '#36B37E', bgColor: '#E8FFF0' },
  { key: 'run', label: '临时跑腿', color: '#FF7A45', bgColor: '#FFF2EC' }
];

export const urgentLevelList: { key: UrgentLevel; label: string; color: string; bgColor: string }[] = [
  { key: 'high', label: '紧急', color: '#F53F3F', bgColor: '#FFE8E8' },
  { key: 'medium', label: '普通', color: '#FFAB00', bgColor: '#FFF8E1' },
  { key: 'low', label: '不急', color: '#36B37E', bgColor: '#E8FFF0' }
];

export const helperStatusList: { key: HelperStatus; label: string; color: string; bgColor: string }[] = [
  { key: 'pending', label: '待响应', color: '#FF7A45', bgColor: '#FFF2EC' },
  { key: 'accepted', label: '已接单', color: '#4C9AFF', bgColor: '#E8F3FF' },
  { key: 'in_progress', label: '进行中', color: '#722ED1', bgColor: '#F3E8FF' },
  { key: 'completed', label: '已完成', color: '#36B37E', bgColor: '#E8FFF0' },
  { key: 'cancelled', label: '已取消', color: '#9C8A8A', bgColor: '#F7F5F3' }
];

export const rewardTypeList: { key: RewardType; label: string }[] = [
  { key: 'free', label: '无偿互助' },
  { key: 'money', label: '现金酬谢' },
  { key: 'gift', label: '小礼物' },
  { key: 'exchange', label: '互相帮助' }
];

export function getHelperTypeMeta(type: HelperType) {
  return helperTypeList.find(t => t.key === type) || helperTypeList[0];
}

export function getUrgentLevelMeta(level: UrgentLevel) {
  return urgentLevelList.find(l => l.key === level) || urgentLevelList[1];
}

export function getHelperStatusMeta(status: HelperStatus) {
  return helperStatusList.find(s => s.key === status) || helperStatusList[0];
}

export function getRewardTypeLabel(type: RewardType) {
  return rewardTypeList.find(r => r.key === type)?.label || '无偿互助';
}

export function formatTime(time: string) {
  const now = dayjs();
  const target = dayjs(time);
  const diff = now.diff(target, 'minute');

  if (diff < 1) return '刚刚';
  if (diff < 60) return `${diff}分钟前`;
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
  if (diff < 4320) return `${Math.floor(diff / 1440)}天前`;
  return target.format('MM-DD HH:mm');
}

export function formatDateTime(time: string) {
  return dayjs(time).format('MM月DD日 HH:mm');
}

export function formatDistance(distance: number) {
  if (distance < 100) return '同楼栋';
  if (distance < 500) return `${distance}米`;
  return `${(distance / 1000).toFixed(1)}千米`;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
