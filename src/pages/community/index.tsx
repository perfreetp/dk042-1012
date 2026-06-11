import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import { mockNotices, mockThanks } from '@/data/notices';
import { formatTime } from '@/utils';
import type { NoticeItem, ThanksItem } from '@/types';
import styles from './index.module.scss';

type TabType = 'notice' | 'thanks';

const CommunityPage: React.FC = () => {
  const [tab, setTab] = useState<TabType>('notice');
  const [notices] = useState<NoticeItem[]>(mockNotices);
  const [thanks] = useState<ThanksItem[]>(mockThanks);
  const [refreshing, setRefreshing] = useState(false);

  useDidShow(() => {
    console.log('[Community] page show');
  });

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const sortedNotices = useMemo(() => {
    return [...notices].sort((a, b) => {
      if (a.isTop !== b.isTop) return a.isTop ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notices]);

  const getTypeBadgeStyle = (type: NoticeItem['type']) => {
    switch (type) {
      case 'warning':
        return { background: '#FFE8E8', color: '#F53F3F' };
      case 'activity':
        return { background: '#FFF2EC', color: '#FF7A45' };
      default:
        return { background: '#E8F3FF', color: '#4C9AFF' };
    }
  };

  const getTypeLabel = (type: NoticeItem['type']) => {
    switch (type) {
      case 'warning':
        return '提醒';
      case 'activity':
        return '活动';
      default:
        return '通知';
    }
  };

  const handleNoticeClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/notice-detail/index?id=${id}` });
  };

  const handleThanksClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/thanks-detail/index?id=${id}` });
  };

  const handleReport = () => {
    Taro.navigateTo({ url: '/pages/report/index' });
  };

  const handleAdmin = () => {
    Taro.navigateTo({ url: '/pages/admin/index' });
  };

  const handleVolunteer = () => {
    Taro.showToast({ title: '志愿者报名功能开发中', icon: 'none' });
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
        <View className={styles.title}>邻里社区</View>
        <View className={styles.subtitle}>共建温暖和谐的美好家园</View>
        <View className={styles.tabs}>
          <View
            className={classnames(styles.tab, tab === 'notice' && styles.active)}
            onClick={() => setTab('notice')}
          >
            📢 邻里公告
          </View>
          <View
            className={classnames(styles.tab, tab === 'thanks' && styles.active)}
            onClick={() => setTab('thanks')}
          >
            💖 感谢墙
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <SectionHeader title='快捷入口' />
        <View className={styles.entryGrid}>
          <View className={styles.entryItem} onClick={handleVolunteer}>
            <View className={styles.entryIcon} style={{ background: '#FFF2EC' }}>
              <Text>🤝</Text>
            </View>
            <Text className={styles.entryLabel}>志愿者</Text>
          </View>
          <View className={styles.entryItem} onClick={handleAdmin}>
            <View className={styles.entryIcon} style={{ background: '#E8F3FF' }}>
              <Text>🛡️</Text>
            </View>
            <Text className={styles.entryLabel}>管理员</Text>
          </View>
          <View className={styles.entryItem} onClick={handleReport}>
            <View className={styles.entryIcon} style={{ background: '#FFE8E8' }}>
              <Text>🚨</Text>
            </View>
            <Text className={styles.entryLabel}>违规举报</Text>
          </View>
        </View>

        {tab === 'notice' ? (
          <View>
            <SectionHeader title='公告列表' subtitle={`${sortedNotices.length}条`} />
            {sortedNotices.length > 0 ? (
              sortedNotices.map(notice => {
                const badgeStyle = getTypeBadgeStyle(notice.type);
                return (
                  <View
                    key={notice.id}
                    className={styles.noticeCard}
                    onClick={() => handleNoticeClick(notice.id)}
                  >
                    <View className={styles.noticeHeader}>
                      {notice.isTop && <View className={styles.topBadge}>置顶</View>}
                      <View
                        className={styles.typeBadge}
                        style={badgeStyle}
                      >
                        {getTypeLabel(notice.type)}
                      </View>
                      <Text className={styles.noticeTitle}>{notice.title}</Text>
                    </View>
                    <View className={styles.noticeMeta}>
                      <Text className={styles.publisher}>{notice.publisher}</Text>
                      <Text className={styles.time}>{formatTime(notice.createdAt)}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <EmptyState emoji='📢' title='暂无公告' text='社区公告会在这里展示~' />
            )}
          </View>
        ) : (
          <View>
            <SectionHeader title='邻里感谢' subtitle={`${thanks.length}条`} />
            {thanks.length > 0 ? (
              thanks.map(item => (
                <View
                  key={item.id}
                  className={styles.thanksCard}
                  onClick={() => handleThanksClick(item.id)}
                >
                  <View className={styles.thanksHeader}>
                    <View className={styles.thanksAvatars}>
                      <Image className={classnames(styles.avatar, styles.to)} src={item.toUserAvatar} mode='aspectFill' />
                      <Image className={classnames(styles.avatar, styles.from)} src={item.fromUserAvatar} mode='aspectFill' />
                    </View>
                    <View className={styles.thanksUsers}>
                      <View className={styles.userRow}>
                        <Text className={styles.userName}>{item.fromUserName}</Text>
                        <Text className={styles.arrow}>→</Text>
                        <Text className={styles.toName}>{item.toUserName}</Text>
                      </View>
                      <Text className={styles.helperTitle}>📌 {item.helperTitle}</Text>
                    </View>
                  </View>
                  <Text className={styles.thanksContent}>{item.content}</Text>
                  <View className={styles.thanksFooter}>
                    <Text className={styles.timeText}>{formatTime(item.createdAt)}</Text>
                    <View className={styles.actions}>
                      <View className={styles.actionItem}>
                        <Text className={styles.actionIcon}>❤️</Text>
                        <Text>{item.likes}</Text>
                      </View>
                      <View className={styles.actionItem}>
                        <Text className={styles.actionIcon}>💬</Text>
                        <Text>{item.comments}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                emoji='💖'
                title='暂无感谢'
                text='完成互助后别忘了来这里感谢你的好邻居~'
              />
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CommunityPage;
