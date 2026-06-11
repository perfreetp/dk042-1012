import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import HelperCard from '@/components/HelperCard';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import { mockNotices, currentUser } from '@/data/notices';
import { useAppStore } from '@/store';
import type { HelperType } from '@/types';
import { helperTypeList, urgentLevelList } from '@/utils';
import styles from './index.module.scss';

type FilterType = 'all' | HelperType;
type FilterUrgent = 'all' | 'high' | 'medium' | 'low';

const HomePage: React.FC = () => {
  const helpers = useAppStore((s) => s.helpers);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [urgentFilter, setUrgentFilter] = useState<FilterUrgent>('all');
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

  const topNotice = mockNotices.find(n => n.isTop) || mockNotices[0];

  const filteredHelpers = useMemo(() => {
    return helpers.filter(h => {
      if (h.status === 'pending_review' || h.status === 'cancelled') return false;
      if (typeFilter !== 'all' && h.type !== typeFilter) return false;
      if (urgentFilter !== 'all' && h.urgentLevel !== urgentFilter) return false;
      return true;
    });
  }, [helpers, typeFilter, urgentFilter]);

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' });
  };

  const handleNoticeClick = () => {
    Taro.navigateTo({ url: `/pages/notice-detail/index?id=${topNotice.id}` });
  };

  const handleQuickType = (type: HelperType) => {
    setTypeFilter(type);
  };

  const handleGoPublish = () => {
    Taro.switchTab({ url: '/pages/publish/index' });
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
        <View className={styles.noticeCard} onClick={handleNoticeClick}>
          <View className={styles.noticeLabel}>公告</View>
          <View className={styles.noticeContent}>{topNotice.title}</View>
          <Text className={styles.noticeArrow}>›</Text>
        </View>

        <View className={styles.quickType}>
          {helperTypeList.map(item => (
            <View
              key={item.key}
              className={styles.quickTypeItem}
              onClick={() => handleQuickType(item.key)}
            >
              <View
                className={styles.quickTypeIcon}
                style={{ background: item.bgColor }}
              >
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

        <SectionHeader title='求助列表' subtitle={`${filteredHelpers.length}条`} />

        <View className={styles.filterBar}>
          <View
            className={classnames(styles.filterItem, typeFilter === 'all' && styles.active)}
            onClick={() => setTypeFilter('all')}
          >
            全部类型
          </View>
          {helperTypeList.map(t => (
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
          {urgentLevelList.map(u => (
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
            filteredHelpers.map(h => (
              <HelperCard key={h.id} data={h} />
            ))
          ) : (
            <EmptyState
              emoji='🤝'
              title='暂无匹配的求助'
              text='换个筛选条件看看，或者主动发布一条求助吧'
              showBtn
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
