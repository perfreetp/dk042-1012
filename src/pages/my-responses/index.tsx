import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import HelperCard from '@/components/HelperCard';
import EmptyState from '@/components/EmptyState';
import { mockHelpers } from '@/data/helpers';
import { currentUser } from '@/data/notices';
import type { HelperRequest, HelperStatus } from '@/types';
import styles from './index.module.scss';

type TabType = 'all' | 'accepted' | 'in_progress' | 'completed' | 'rejected';

const tabList: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'accepted', label: '已接单' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'rejected', label: '未选中' }
];

const MyResponsesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [helpers, setHelpers] = useState<HelperRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    const myResponses = mockHelpers.filter(h =>
      h.responders.some(r => r.id === currentUser.id)
    );
    setHelpers(myResponses);
  };

  useDidShow(() => {
    loadData();
  });

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const filteredHelpers = useMemo(() => {
    if (activeTab === 'all') return helpers;
    if (activeTab === 'rejected') {
      return helpers.filter(h =>
        h.responders.some(r => r.id === currentUser.id) &&
        h.acceptedUserId !== currentUser.id &&
        ['completed', 'cancelled'].includes(h.status)
      );
    }
    return helpers.filter(h =>
      h.acceptedUserId === currentUser.id && h.status === activeTab
    );
  }, [helpers, activeTab]);

  const stats = useMemo(() => {
    const accepted = helpers.filter(h => h.acceptedUserId === currentUser.id);
    return {
      total: helpers.length,
      accepted: accepted.length,
      completed: accepted.filter(h => h.status === 'completed').length
    };
  }, [helpers]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  };

  const handleGoHome = () => {
    Taro.switchTab({ url: '/pages/home/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View style={{ fontSize: '36px', fontWeight: '700', color: '#FFFFFF' }}>我响应的求助</View>
        <View style={{ fontSize: '24px', color: 'rgba(255,255,255,0.85)', marginTop: '8px' }}>
          乐于助人的好邻居！已成功帮助 {stats.completed} 位邻居
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <View className={styles.statNum}>{stats.total}</View>
            <View className={styles.statLabel}>响应数</View>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statNum}>{stats.accepted}</View>
            <View className={styles.statLabel}>被选中</View>
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
                emoji='🤝'
                title={activeTab === 'all' ? '还没有响应任何求助' : '该分类下暂无记录'}
                text={activeTab === 'all' ? '去广场看看有哪些需要帮忙的邻居吧~' : '切换其他分类看看'}
                showBtn={activeTab === 'all'}
                btnText='去求助广场'
                onBtnClick={handleGoHome}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MyResponsesPage;
