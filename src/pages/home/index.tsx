import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import HelperCard from '@/components/HelperCard';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import { mockNotices, currentUser } from '@/data/notices';
import { useAppStore } from '@/store';
import type { HelperType, HelperRequest } from '@/types';
import { helperTypeList, urgentLevelList } from '@/utils';
import styles from './index.module.scss';

type FilterType = 'all' | HelperType;
type FilterUrgent = 'all' | 'high' | 'medium' | 'low';
type FilterScope = 'public' | 'cancelled';

const HomePage: React.FC = () => {
  const helpers = useAppStore((s) => s.helpers);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [urgentFilter, setUrgentFilter] = useState<FilterUrgent>('all');
  const [scopeFilter, setScopeFilter] = useState<FilterScope>('public');
  const [refreshing, setRefreshing] = useState(false);

  useDidShow(() => {
    console.log('[Home] page show, helpers count:', helpers.length);
  });

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 600);
  });

  const topNotice = mockNotices.find((n) => n.isTop) || mockNotices[0];

  const myPendingReview = useMemo(
    () => helpers.filter((h) => h.publisherId === currentUser.id && h.status === 'pending_review'),
    [helpers]
  );

  const myCancelled = useMemo(
    () => helpers.filter((h) => h.publisherId === currentUser.id && h.status === 'cancelled'),
    [helpers]
  );

  const filteredHelpers = useMemo(() => {
    return helpers.filter((h) => {
      if (scopeFilter === 'public') {
        if (h.status === 'pending_review' || h.status === 'cancelled') return false;
      } else {
        if (h.status !== 'cancelled') return false;
      }
      if (typeFilter !== 'all' && h.type !== typeFilter) return false;
      if (urgentFilter !== 'all' && h.urgentLevel !== urgentFilter) return false;
      return true;
    });
  }, [helpers, typeFilter, urgentFilter, scopeFilter]);

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' });
  };

  const handleNoticeClick = () => {
    Taro.navigateTo({ url: `/pages/notice-detail/index?id=${topNotice.id}` });
  };

  const handleQuickType = (type: HelperType) => {
    setTypeFilter(type);
    setScopeFilter('public');
  };

  const handleGoPublish = () => {
    Taro.switchTab({ url: '/pages/publish/index' });
  };

  const handleGoDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const handleGoMyRequests = () => {
    Taro.navigateTo({ url: '/pages/my-requests/index' });
  };

  return (
    <ScrollView
      className={styles.page}
      scrollY
      enhanced
      showScrollbar={false}
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={() => {
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
          Taro.showToast({ title: '刷新成功', icon: 'success' });
        }, 1000);
      }}
    >
      <View className={styles.header}>
        <View className={styles.welcome}>👋 你好，{currentUser.name}</View>
        <View className={styles.title}>邻里互助广场</View>
        <View className={styles.subtitle}>远亲不如近邻，有困难随时说~</View>
        <View className={styles.searchBox} onClick={handleSearch}>
          <Text className={styles.searchIcon}>🔍</Text>
          <View className={styles.searchPlaceholder}>搜索求助内容、楼栋号...</View>
        </View>
      </View>

      <View className={styles.content}>
        {myPendingReview.length > 0 && (
          <View className={styles.pendingReviewCard}>
            <View className={styles.pendingReviewHeader}>
              <View className={styles.pendingReviewTitle}>
                ⏳ 我的待审核求助
                <View className={styles.pendingReviewBadge}>{myPendingReview.length}</View>
              </View>
              <Text
                style={{ fontSize: 22, color: '#B8860B' }}
                onClick={handleGoMyRequests}
              >
                查看全部 ›
              </Text>
            </View>
            {myPendingReview.slice(0, 3).map((h: HelperRequest) => (
              <View
                key={h.id}
                className={styles.pendingReviewItem}
                onClick={() => handleGoDetail(h.id)}
              >
                <Text className={styles.pendingReviewItemTitle}>{h.title}</Text>
                <Text className={styles.pendingReviewItemArrow}>查看 ›</Text>
              </View>
            ))}
          </View>
        )}

        {myCancelled.length > 0 && (
          <View className={styles.cancelledCard}>
            <View className={styles.cancelledHeader}>
              <View className={styles.cancelledTitle}>
                ❌ 我的已取消求助
                <View className={styles.cancelledBadge}>{myCancelled.length}</View>
              </View>
              <Text
                style={{ fontSize: 22, color: '#B33A3A' }}
                onClick={handleGoMyRequests}
              >
                查看全部 ›
              </Text>
            </View>
            {myCancelled.slice(0, 2).map((h: HelperRequest) => (
              <View
                key={h.id}
                className={styles.cancelledItem}
                onClick={() => handleGoDetail(h.id)}
              >
                <Text className={styles.cancelledItemTitle}>{h.title}</Text>
                {h.cancelReason && (
                  <Text className={styles.cancelledItemReason}>{h.cancelReason}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View className={styles.noticeCard} onClick={handleNoticeClick}>
          <View className={styles.noticeLabel}>公告</View>
          <View className={styles.noticeContent}>{topNotice.title}</View>
          <Text className={styles.noticeArrow}>›</Text>
        </View>

        <View className={styles.quickType}>
          {helperTypeList.map((item) => (
            <View
              key={item.key}
              className={styles.quickTypeItem}
              onClick={() => handleQuickType(item.key)}
            >
              <View className={styles.quickTypeIcon} style={{ background: item.bgColor }}>
                <Text>
                  {item.key === 'express' && '📦'}
                  {item.key === 'care' && '👶'}
                  {item.key === 'move' && '📦'}
                  {item.key === 'tool' && '🔧'}
                  {item.key === 'run' && '🏃'}
                </Text>
              </View>
              <Text className={styles.quickTypeLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader
          title={scopeFilter === 'public' ? '求助列表' : '已取消专区'}
          subtitle={`${filteredHelpers.length}条`}
        />

        <View className={styles.filterBar}>
          <View
            className={classnames(styles.filterItem, scopeFilter === 'public' && styles.active)}
            onClick={() => setScopeFilter('public')}
          >
            公开广场
          </View>
          <View
            className={classnames(styles.filterItem, scopeFilter === 'cancelled' && styles.active)}
            onClick={() => setScopeFilter('cancelled')}
          >
            已取消专区
          </View>
        </View>

        <View className={styles.filterBar}>
          <View
            className={classnames(styles.filterItem, typeFilter === 'all' && styles.active)}
            onClick={() => setTypeFilter('all')}
          >
            全部类型
          </View>
          {helperTypeList.map((t) => (
            <View
              key={t.key}
              className={classnames(styles.filterItem, typeFilter === t.key && styles.active)}
              onClick={() => setTypeFilter(t.key)}
            >
              {t.label}
            </View>
          ))}
        </View>

        <View className={styles.filterBar}>
          <View
            className={classnames(styles.filterItem, urgentFilter === 'all' && styles.active)}
            onClick={() => setUrgentFilter('all')}
          >
            全部紧急度
          </View>
          {urgentLevelList.map((u) => (
            <View
              key={u.key}
              className={classnames(styles.filterItem, urgentFilter === u.key && styles.active)}
              onClick={() => setUrgentFilter(u.key)}
            >
              {u.label}
            </View>
          ))}
        </View>

        <View className={styles.listContainer}>
          {filteredHelpers.length > 0 ? (
            filteredHelpers.map((h) => <HelperCard key={h.id} data={h} />)
          ) : (
            <EmptyState
              emoji={scopeFilter === 'cancelled' ? '🗑️' : '🤝'}
              title={scopeFilter === 'cancelled' ? '暂无已取消的求助' : '暂无匹配的求助'}
              text={
                scopeFilter === 'cancelled'
                  ? '被管理员驳回或主动取消的求助会在这里展示'
                  : '换个筛选条件看看，或者主动发布一条求助吧'
              }
              showBtn={scopeFilter === 'public'}
              btnText='去发布求助'
              onBtnClick={handleGoPublish}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
