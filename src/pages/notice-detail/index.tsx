import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { mockNotices } from '@/data/notices';
import type { NoticeItem } from '@/types';
import { formatDateTime } from '@/utils';
import styles from './index.module.scss';

const NoticeDetailPage: React.FC = () => {
  const router = useRouter();
  const [notice, setNotice] = useState<NoticeItem | null>(null);

  const loadData = () => {
    const id = router.params.id;
    const item = mockNotices.find(n => n.id === id);
    if (item) {
      setNotice(item);
    } else if (mockNotices.length > 0) {
      setNotice(mockNotices[0]);
    }
  };

  useDidShow(() => {
    loadData();
  });

  const getTypeTagClass = (type: string) => {
    switch (type) {
      case 'system': return styles.tagSystem;
      case 'activity': return styles.tagActivity;
      case 'warning': return styles.tagWarning;
      default: return styles.tagSystem;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'system': return '系统通知';
      case 'activity': return '社区活动';
      case 'warning': return '重要提醒';
      default: return '通知';
    }
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handleReport = () => {
    Taro.navigateTo({ url: '/pages/report/index?targetType=notice' });
  };

  if (!notice) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 120, textAlign: 'center', color: '#999' }}>加载中...</View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.topBanner}>
          <View className={classnames(styles.typeTag, getTypeTagClass(notice.type))}>
            {getTypeLabel(notice.type)}
          </View>
          {notice.isTop && (
            <View className={styles.topBadge}>置顶</View>
          )}
        </View>

        <View className={styles.title}>{notice.title}</View>

        <View className={styles.metaRow}>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>🏢</Text>
            <Text>{notice.publisher}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>🕐</Text>
            <Text>{formatDateTime(notice.createdAt)}</Text>
          </View>
        </View>

        <View className={styles.content}>
          {notice.content}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.secondaryBtn} onClick={handleReport}>
          举报
        </View>
        <View className={styles.primaryBtn} onClick={handleShare}>
          分享给邻居
        </View>
      </View>
    </View>
  );
};

export default NoticeDetailPage;
