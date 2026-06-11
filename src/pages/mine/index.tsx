import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { currentUser } from '@/data/notices';
import { mockHelpers } from '@/data/helpers';
import { formatTime, getHelperStatusMeta } from '@/utils';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const user = currentUser;
  const [activeCount] = useState(
    mockHelpers.filter(h => h.publisherId === user.id && ['pending', 'accepted', 'in_progress'].includes(h.status)).length
  );
  const [respondCount] = useState(
    mockHelpers.filter(h => h.responders.some(r => r.id === user.id) && ['pending', 'accepted', 'in_progress'].includes(h.status)).length
  );

  useDidShow(() => {
    console.log('[Mine] page show');
  });

  const myActiveRequests = mockHelpers
    .filter(h => h.publisherId === user.id && ['pending', 'accepted', 'in_progress'].includes(h.status))
    .slice(0, 3);

  const handleMyRequests = () => {
    Taro.navigateTo({ url: '/pages/my-requests/index' });
  };

  const handleMyResponses = () => {
    Taro.navigateTo({ url: '/pages/my-responses/index' });
  };

  const handleCredit = () => {
    Taro.navigateTo({ url: '/pages/credit/index' });
  };

  const handleAddresses = () => {
    Taro.navigateTo({ url: '/pages/addresses/index' });
  };

  const handleBlacklist = () => {
    Taro.navigateTo({ url: '/pages/blacklist/index' });
  };

  const handleReport = () => {
    Taro.navigateTo({ url: '/pages/report/index' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  };

  const gotoDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <View className={styles.userRow}>
          <Image className={styles.avatar} src={user.avatar} mode='aspectFill' />
          <View className={styles.userInfo}>
            <View className={styles.nameRow}>
              <Text className={styles.name}>{user.name}</Text>
              <Text className={styles.building}>{user.building}{user.unit}</Text>
            </View>
            <View className={styles.phone}>{user.phone}</View>
            <View className={styles.creditRow}>
              <Text className={styles.creditLabel}>⭐ 信用分</Text>
              <Text className={styles.creditScore}>{user.creditScore}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{user.helpCount}</Text>
          <Text className={styles.statLabel}>发布求助</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{user.helpedCount}</Text>
          <Text className={styles.statLabel}>帮助他人</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{user.creditScore}</Text>
          <Text className={styles.statLabel}>信用积分</Text>
        </View>
      </View>

      <View className={styles.content}>
        {myActiveRequests.length > 0 && (
          <View>
            <View className={styles.sectionTitle}>求助进度提醒</View>
            <View className={styles.progressList}>
              {myActiveRequests.map(h => {
                const statusMeta = getHelperStatusMeta(h.status);
                return (
                  <View
                    key={h.id}
                    className={styles.progressItem}
                    onClick={() => gotoDetail(h.id)}
                  >
                    <View
                      className={styles.progressIcon}
                      style={{ background: statusMeta.bgColor }}
                    >
                      <Text style={{ color: statusMeta.color }}>
                        {h.type === 'express' && '📦'}
                        {h.type === 'care' && '👶'}
                        {h.type === 'move' && '📦'}
                        {h.type === 'tool' && '🔧'}
                        {h.type === 'run' && '🏃'}
                      </Text>
                    </View>
                    <View className={styles.progressContent}>
                      <Text className={styles.progressTitle}>{h.title}</Text>
                      <Text className={styles.progressDesc}>{formatTime(h.updatedAt)}更新</Text>
                    </View>
                    <View
                      className={styles.progressStatus}
                      style={{ background: statusMeta.bgColor, color: statusMeta.color }}
                    >
                      {statusMeta.label}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View className={styles.sectionTitle}>互助管理</View>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleMyRequests}>
            <View className={styles.menuIcon} style={{ background: '#FFF2EC' }}>
              <Text>📝</Text>
            </View>
            <Text className={styles.menuText}>我发布的求助</Text>
            {activeCount > 0 && <View className={styles.menuBadge}>{activeCount}</View>}
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleMyResponses}>
            <View className={styles.menuIcon} style={{ background: '#E8FFF0' }}>
              <Text>🤝</Text>
            </View>
            <Text className={styles.menuText}>我响应的求助</Text>
            {respondCount > 0 && <View className={styles.menuBadge}>{respondCount}</View>}
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleCredit}>
            <View className={styles.menuIcon} style={{ background: '#FFF8E1' }}>
              <Text>⭐</Text>
            </View>
            <Text className={styles.menuText}>信用评价</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View className={styles.sectionTitle}>设置与隐私</View>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleAddresses}>
            <View className={styles.menuIcon} style={{ background: '#E8F3FF' }}>
              <Text>📍</Text>
            </View>
            <Text className={styles.menuText}>常用地址</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleBlacklist}>
            <View className={styles.menuIcon} style={{ background: '#FFE8E8' }}>
              <Text>🚫</Text>
            </View>
            <Text className={styles.menuText}>黑名单管理</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleReport}>
            <View className={styles.menuIcon} style={{ background: '#F3E8FF' }}>
              <Text>🚨</Text>
            </View>
            <Text className={styles.menuText}>违规举报记录</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View className={styles.sectionTitle}>其他</View>
        <View className={styles.menuCard}>
          <View className={styles.menuItem}>
            <View className={styles.menuIcon} style={{ background: '#E8FFF0' }}>
              <Text>❓</Text>
            </View>
            <Text className={styles.menuText}>帮助中心</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <View className={styles.menuIcon} style={{ background: '#FFF2EC' }}>
              <Text>💡</Text>
            </View>
            <Text className={styles.menuText}>意见反馈</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleLogout}>
            <View className={styles.menuIcon} style={{ background: '#FFE8E8' }}>
              <Text>🚪</Text>
            </View>
            <Text className={styles.menuText}>退出登录</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View style={{ textAlign: 'center', padding: '32rpx 0', fontSize: 22, color: '#C9CDD4' }}>
          邻里互助 v1.0.0 · 共建温暖社区
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
