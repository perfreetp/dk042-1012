import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { mockThanks } from '@/data/notices';
import type { ThanksItem } from '@/types';
import { formatDateTime } from '@/utils';
import styles from './index.module.scss';

const ThanksDetailPage: React.FC = () => {
  const router = useRouter();
  const [thanks, setThanks] = useState<ThanksItem | null>(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const loadData = () => {
    const id = router.params.id;
    const item = mockThanks.find(t => t.id === id);
    if (item) {
      setThanks(item);
      setLikes(item.likes);
    } else if (mockThanks.length > 0) {
      setThanks(mockThanks[0]);
      setLikes(mockThanks[0].likes);
    }
  };

  useDidShow(() => {
    loadData();
  });

  const handleLike = () => {
    if (!thanks) return;
    if (liked) {
      setLikes(prev => prev - 1);
      setLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setLiked(true);
      Taro.showToast({ title: '已点赞', icon: 'none' });
    }
  };

  const handleGoHelper = () => {
    if (!thanks) return;
    Taro.navigateTo({
      url: `/pages/detail/index?id=${thanks.helperRequestId}`
    });
  };

  const handleComment = () => {
    Taro.showToast({ title: '留言功能开发中', icon: 'none' });
  };

  if (!thanks) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 120, textAlign: 'center', color: '#999' }}>加载中...</View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.banner}>
        <View className={styles.bannerTitle}>❤️ 邻里感谢信</View>
        <View className={styles.bannerSub}>一份感谢，温暖整个社区</View>
      </View>

      <View className={styles.card}>
        <View className={styles.usersRow}>
          <View className={styles.userBlock}>
            <Image
              className={styles.avatarBig}
              src={thanks.fromUserAvatar}
              mode='aspectFill'
            />
            <View className={styles.userNameBig}>{thanks.fromUserName}</View>
            <View className={styles.userRole}>感谢人</View>
          </View>
          <View className={styles.heartIcon}>💗</View>
          <View className={styles.userBlock}>
            <Image
              className={styles.avatarBig}
              src={thanks.toUserAvatar}
              mode='aspectFill'
            />
            <View className={styles.userNameBig}>{thanks.toUserName}</View>
            <View className={styles.userRole}>被感谢人</View>
          </View>
        </View>

        <View className={styles.helperRef} onClick={handleGoHelper}>
          <Text className={styles.refIcon}>📋</Text>
          <View className={styles.refContent}>
            <View className={styles.refLabel}>关联求助</View>
            <View className={styles.refTitle}>{thanks.helperTitle}</View>
          </View>
          <Text style={{ fontSize: '32px', color: '#FF7A45' }}>›</Text>
        </View>

        <View className={styles.thanksContent}>
          <View className={[styles.quoteMark, styles.quoteTop].join(' ')}>"</View>
          <View className={styles.thanksText}>
            {thanks.content}
          </View>
          <View className={[styles.quoteMark, styles.quoteBottom].join(' ')}>"</View>
        </View>

        <View className={styles.interactions}>
          <View
            className={[styles.interItem, liked && styles.liked].join(' ')}
            onClick={handleLike}
          >
            <Text className={styles.interIcon}>{liked ? '❤️' : '🤍'}</Text>
            <Text>{likes}</Text>
          </View>
          <View className={styles.interItem} onClick={handleComment}>
            <Text className={styles.interIcon}>💬</Text>
            <Text>{thanks.comments} 评论</Text>
          </View>
        </View>

        <View className={styles.timeText}>
          发布于 {formatDateTime(thanks.createdAt)}
        </View>
      </View>

      <View className={styles.commentSection}>
        <View className={styles.commentHeader}>邻里评论</View>
        <View className={styles.commentEmpty}>
          暂无评论，快来抢沙发~
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.commentInput} onClick={handleComment}>
          <Text className={styles.inputPlaceholder}>说点温暖的话...</Text>
        </View>
        <View className={styles.commentBtn} onClick={handleComment}>
          发送
        </View>
      </View>
    </View>
  );
};

export default ThanksDetailPage;
