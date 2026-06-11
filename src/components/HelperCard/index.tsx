import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { HelperRequest } from '@/types';
import { getHelperTypeMeta, getUrgentLevelMeta, getHelperStatusMeta, formatTime, formatDistance } from '@/utils';
import styles from './index.module.scss';

interface HelperCardProps {
  data: HelperRequest;
  onClick?: (data: HelperRequest) => void;
}

const HelperCard: React.FC<HelperCardProps> = ({ data, onClick }) => {
  const typeMeta = getHelperTypeMeta(data.type);
  const urgentMeta = getUrgentLevelMeta(data.urgentLevel);
  const statusMeta = getHelperStatusMeta(data.status);

  const handleClick = () => {
    if (onClick) {
      onClick(data);
    } else {
      Taro.navigateTo({
        url: `/pages/detail/index?id=${data.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.leftGroup}>
          <View
            className={styles.typeTag}
            style={{ background: typeMeta.bgColor, color: typeMeta.color }}
          >
            {typeMeta.label}
          </View>
          <View
            className={styles.urgentTag}
            style={{ background: urgentMeta.bgColor, color: urgentMeta.color }}
          >
            {urgentMeta.label}
          </View>
        </View>
        <View
          className={styles.statusTag}
          style={{ background: statusMeta.bgColor, color: statusMeta.color }}
        >
          {statusMeta.label}
        </View>
      </View>

      <View className={styles.title}>{data.title}</View>
      <View className={styles.desc}>{data.description}</View>

      <View className={styles.cardMeta}>
        <View className={styles.metaItem}>
          <Text>📍</Text>
          <Text>{data.building}{data.unit} · {formatDistance(data.distance)}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text>⏰</Text>
          <Text>{formatTime(data.createdAt)}发布</Text>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={data.publisher.avatar} mode='aspectFill' />
          <View>
            <View className={styles.userName}>{data.publisher.name}</View>
            <View className={styles.userBuilding}>信用 {data.publisher.creditScore}分</View>
          </View>
        </View>
        <View className={styles.rewardInfo}>
          <View className={styles.rewardBadge}>{data.rewardDetail}</View>
          <Text className={styles.responderCount}>
            {data.responders.length}/{data.maxResponders}人响应
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HelperCard;
