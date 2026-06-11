import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import HelperCard from '@/components/HelperCard';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import { currentUser } from '@/data/notices';
import type { HelperStatus } from '@/types';
import { helperStatusList } from '@/utils';
import styles from './index.module.scss';

type TabType = 'all' | HelperStatus;

const tabList: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending_review', label: '待审核' },
  { key: 'pending', label: '待响应' },
  { key: 'accepted', label: '已接单' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
];

const MyRequestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
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

  const filteredHelpers = useMemo(() => {
    if (activeTab === 'all') return helpers;
    return helpers.filter(h => h.status === activeTab);
  }, [helpers, activeTab]);

  const stats = useMemo(() => {
    return {
      total: helpers.length,
      completed: helpers.filter(h => h.status === 'completed').length,
      ongoing: helpers.filter(h => ['pending', 'accepted', 'in_progress'].includes(h.status)).length
    };
  }, [helpers]);

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

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View style={{ fontSize: '36px', fontWeight: '700', color: '#FFFFFF' }}>我发布的求助</View>
        <View style={{ fontSize: '24px', color: 'rgba(255,255,255,0.85)', marginTop: '8px' }}>
          共发布 {stats.total} 条求助，完成率 {stats.total ? Math.round(stats.completed / stats.total * 100) : 0}%
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <View className={styles.statNum}>{stats.total}</View>
            <View className={styles.statLabel}>总计</View>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statNum}>{stats.ongoing}</View>
            <View className={styles.statLabel}>进行中</View>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statNum}>{stats.completed}</View>
            <View className={styles.statLabel}>已完成</View>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabList.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.activeTab)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
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
          {filteredHelpers.length > 0 ? (
            filteredHelpers.map(h => (
              <HelperCard key={h.id} data={h} />
            ))
          ) : (
            <View className={styles.emptyWrap}>
              <EmptyState
                emoji='📝'
                title={activeTab === 'all' ? '还没有发布求助' : '该状态下暂无求助'}
                text={activeTab === 'all' ? '有需要邻居帮忙的事情，就发条求助吧~' : '切换其他状态看看'}
                showBtn={activeTab === 'all'}
                btnText='去发布求助'
                onBtnClick={handleGoPublish}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MyRequestsPage;
