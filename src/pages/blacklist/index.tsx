import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import EmptyState from '@/components/EmptyState';
import { mockBlacklist } from '@/data/notices';
import type { BlacklistItem } from '@/types';
import { formatDateTime } from '@/utils';
import styles from './index.module.scss';

const BlacklistPage: React.FC = () => {
  const [list, setList] = useState<BlacklistItem[]>(mockBlacklist);

  const handleRemove = (item: BlacklistItem) => {
    Taro.showModal({
      title: '确认移除',
      content: `确定要将「${item.userName}」移出黑名单吗？`,
      confirmColor: '#FF7A45',
      success: (res) => {
        if (res.confirm) {
          setList(prev => prev.filter(i => i.id !== item.id));
          Taro.showToast({ title: '已移除', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.tipBar}>
        <Text className={styles.tipIcon}>💡</Text>
        <View className={styles.tipContent}>
          加入黑名单后，将不会再看到对方发布的求助信息，且对方无法响应你的求助。
        </View>
      </View>

      {list.length > 0 ? (
        <View className={styles.list}>
          {list.map(item => (
            <View key={item.id} className={styles.userItem}>
              <Image
                className={styles.avatar}
                src={item.userAvatar}
                mode='aspectFill'
              />
              <View className={styles.userInfo}>
                <View className={styles.userName}>{item.userName}</View>
                <View className={styles.reasonRow}>拉黑原因：{item.reason}</View>
                <View className={styles.timeRow}>{formatDateTime(item.createdAt)}</View>
              </View>
              <View
                className={styles.removeBtn}
                onClick={() => handleRemove(item)}
              >
                移除
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyWrap}>
          <EmptyState
            emoji='✅'
            title='黑名单是空的'
            text='当前没有拉黑任何用户，邻里关系很和谐呢~'
          />
        </View>
      )}
    </View>
  );
};

export default BlacklistPage;
