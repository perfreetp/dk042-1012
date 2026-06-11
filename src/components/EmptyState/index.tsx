import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  emoji?: string;
  title?: string;
  text?: string;
  showBtn?: boolean;
  btnText?: string;
  onBtnClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '📭',
  title = '暂无内容',
  text = '这里还空空如也，快去做点什么吧~',
  showBtn = false,
  btnText = '去发布',
  onBtnClick
}) => {
  return (
    <View className={styles.container}>
      <Text className={styles.emoji}>{emoji}</Text>
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.text}>{text}</Text>
      {showBtn && (
        <Button className={styles.btn} onClick={onBtnClick}>
          {btnText}
        </Button>
      )}
    </View>
  );
};

export default EmptyState;
