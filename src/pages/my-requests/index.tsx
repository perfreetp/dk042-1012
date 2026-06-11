import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import HelperCard from '@/components/HelperCard';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import { currentUser } from '@/data/notices';
import type { HelperStatus } from '@/types';
import styles from './index.module.scss';

type GroupKey = 'review' | 'public' | 'ongoing' | 'ended';

const groupConfig: {
  key: GroupKey;
  label: string;
  emoji: string;
  desc: string;
  statuses: HelperStatus[];
  emptyText: string;
  color: string;
  bgColor: string;
}[] = [
  {
    key: 'review',
    label: '审核中',
    emoji: '⏳',
    desc: '等待管理员审核',
    statuses: ['pending_review'],
    emptyText: '没有待审核的求助',
    color: '#FFAB00',
    bgColor: '#FFF8E1'
  },
  {
    key: 'public',
    label: '公开中',
    emoji: '🔔',
    desc: '广场可见，等待响应',
    statuses: ['pending'],
    emptyText: '没有公开中的求助',
    color: '#FF7A45',
    bgColor: '#FFF2EC'
  },
  {
    key: 'ongoing',
    label: '进行中',
    emoji: '🤝',
    desc: '已有人响应，互助进行',
    statuses: ['accepted', 'in_progress'],
    emptyText: '没有进行中的求助',
    color: '#722ED1',
    bgColor: '#F3E8FF'
  },
  {
    key: 'ended',
    label: '已结束',
    emoji: '✅',
    desc: '已完成或已取消',
    statuses: ['completed', 'cancelled'],
    emptyText: '还没有结束的求助',
    color: '#36B37E',
    bgColor: '#E8FFF0'
  }
];

const MyRequestsPage: React.FC = () => {
  const allHelpers = useAppStore((s) => s.helpers);
  const [refreshing, setRefreshing] = useState(false);

  const helpers = useMemo(
    () => allHelpers.filter((h) => h.publisherId === currentUser.id),
    [allHelpers]
  );

  useDidShow(() => {
    console.log('[MyRequests] show, total:', helpers.length);
  });

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 500);
  });

  const groupedHelpers = useMemo(() => {
    const result: Record<GroupKey, typeof helpers> = {
      review: [],
      public: [],
      ongoing: [],
      ended: []
    };
    groupConfig.forEach((g) => {
      result[g.key] = helpers.filter((h) => g.statuses.includes(h.status));
    });
    return result;
  }, [helpers]);

  const stats = useMemo(() => {
    return {
      total: helpers.length,
      review: groupedHelpers.review.length,
      public: groupedHelpers.public.length,
      ongoing: groupedHelpers.ongoing.length,
      ended: groupedHelpers.ended.length,
      completed: groupedHelpers.ended.filter((h) => h.status === 'completed').length
    };
  }, [helpers, groupedHelpers]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 500);
  };

  const handleGoPublish = () => {
    Taro.switchTab({ url: '/pages/publish/index' });
  };

  const scrollToGroup = (key: GroupKey) => {
    const el = document.getElementById(`group-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View style={{ fontSize: '36px', fontWeight: '700', color: '#FFFFFF' }}>我发布的求助</View>
        <View style={{ fontSize: '24px', color: 'rgba(255,255,255,0.85)', marginTop: '8px' }}>
          共发布 {stats.total} 条求助，完成率{' '}
          {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
        </View>
        <View className={styles.statsRow}>
          {groupConfig.map((g) => (
            <View
              key={g.key}
              className={styles.statCard}
              onClick={() => scrollToGroup(g.key)}
            >
              <View className={styles.statNum}>{groupedHelpers[g.key].length}</View>
              <View className={styles.statLabel}>{g.label}</View>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        className={styles.content}
        scrollY
        enhanced
        showScrollbar={false}
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
      >
        <View className={styles.listContainer}>
          {helpers.length === 0 ? (
            <View className={styles.emptyWrap}>
              <EmptyState
                emoji='📝'
                title='还没有发布求助'
                text='有需要邻居帮忙的事情，就发条求助吧~'
                showBtn
                btnText='去发布求助'
                onBtnClick={handleGoPublish}
              />
            </View>
          ) : (
            groupConfig.map((g) => (
              <View key={g.key} id={`group-${g.key}`} className={styles.groupBlock}>
                <View className={styles.groupHeader}>
                  <View className={styles.groupIcon} style={{ background: g.bgColor, color: g.color }}>
                    {g.emoji}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View className={styles.groupTitle}>
                      {g.label}
                      <Text className={styles.groupCount} style={{ color: g.color }}>
                        {groupedHelpers[g.key].length}
                      </Text>
                    </View>
                    <View className={styles.groupDesc}>{g.desc}</View>
                  </View>
                </View>

                {groupedHelpers[g.key].length > 0 ? (
                  <View className={styles.groupList}>
                    {groupedHelpers[g.key].map((h) => (
                      <HelperCard key={h.id} data={h} />
                    ))}
                  </View>
                ) : (
                  <View className={styles.groupEmpty}>{g.emptyText}</View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MyRequestsPage;
