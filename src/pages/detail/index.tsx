import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import { currentUser } from '@/data/notices';
import type { HelperMessage } from '@/types';
import {
  getHelperTypeMeta,
  getUrgentLevelMeta,
  getHelperStatusMeta,
  formatDateTime,
  formatTime,
  formatDistance,
  generateId
} from '@/utils';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id as string;

  const allHelpers = useAppStore((s) => s.helpers);
  const addResponder = useAppStore((s) => s.addResponder);
  const acceptResponder = useAppStore((s) => s.acceptResponder);
  const startHelper = useAppStore((s) => s.startHelper);
  const completeHelper = useAppStore((s) => s.completeHelper);
  const cancelHelper = useAppStore((s) => s.cancelHelper);
  const addMessage = useAppStore((s) => s.addMessage);

  const helper = useMemo(() => allHelpers.find((h) => h.id === id), [allHelpers, id]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useDidShow(() => {
    console.log('[Detail] page show, id:', id, 'found:', !!helper);
  });

  const isPublisher = helper?.publisherId === currentUser.id;
  const isResponder = helper?.responders.some((r) => r.id === currentUser.id);

  const typeMeta = useMemo(() => (helper ? getHelperTypeMeta(helper.type) : null), [helper]);
  const urgentMeta = useMemo(() => (helper ? getUrgentLevelMeta(helper.urgentLevel) : null), [helper]);
  const statusMeta = useMemo(() => (helper ? getHelperStatusMeta(helper.status) : null), [helper]);

  const progressSteps = useMemo(() => {
    if (!helper) return [];
    const steps = [
      { key: 'created', title: '发布求助', desc: formatTime(helper.createdAt), done: true },
      {
        key: 'accepted',
        title: '有人响应',
        desc: helper.responders.length > 0 ? `${helper.responders.length}位邻居愿意帮忙` : '等待邻居响应',
        done: helper.responders.length > 0 || ['accepted', 'in_progress', 'completed'].includes(helper.status)
      },
      {
        key: 'progress',
        title: '互助进行中',
        desc: helper.acceptedUserId ? '已确认协助人' : '等待确认协助人',
        done: ['in_progress', 'completed'].includes(helper.status)
      },
      {
        key: 'completed',
        title: '互助完成',
        desc: helper.completedAt ? formatTime(helper.completedAt) : '等待完成确认',
        done: helper.status === 'completed'
      }
    ];
    if (helper.status === 'cancelled') {
      return [
        { key: 'created', title: '发布求助', desc: formatTime(helper.createdAt), done: true },
        { key: 'cancelled', title: '求助已取消', desc: helper.cancelReason || '用户取消', done: true }
      ];
    }
    return steps;
  }, [helper]);

  if (!helper) {
    return (
      <View className={styles.page}>
        <EmptyState emoji='😢' title='求助不存在' text='该求助可能已被删除' />
      </View>
    );
  }

  const handleSignUp = () => {
    if (helper.status !== 'pending') {
      Taro.showToast({ title: '当前状态无法报名', icon: 'none' });
      return;
    }
    if (helper.responders.length >= helper.maxResponders) {
      Taro.showToast({ title: '响应人数已满', icon: 'none' });
      return;
    }
    if (isResponder) {
      Taro.showToast({ title: '你已报名过了', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认报名',
      content: `确定要帮${helper.publisher.name}完成"${helper.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          addResponder(helper.id, currentUser);
          Taro.showToast({ title: '报名成功！', icon: 'success' });
        }
      }
    });
  };

  const handleAcceptResponder = (userId: string) => {
    Taro.showModal({
      title: '确认协助人',
      content: '确定选择这位邻居帮你完成求助吗？',
      success: (res) => {
        if (res.confirm) {
          acceptResponder(helper.id, userId);
          Taro.showToast({ title: '已确认协助人', icon: 'success' });
        }
      }
    });
  };

  const handleStart = () => {
    startHelper(helper.id);
    Taro.showToast({ title: '已开始互助', icon: 'success' });
  };

  const handleComplete = () => {
    Taro.showModal({
      title: '确认完成',
      content: '互助完成后可以前往感谢墙感谢对方哦~',
      confirmText: '确认完成',
      success: (res) => {
        if (res.confirm) {
          completeHelper(helper.id);
          Taro.showToast({ title: '互助已完成！', icon: 'success' });
        }
      }
    });
  };

  const handleCancel = () => {
    const cancelReasons = ['不再需要了', '自己解决了', '时间冲突', '其他原因'];
    Taro.showActionSheet({
      itemList: cancelReasons,
      success: (res) => {
        const reason = cancelReasons[res.tapIndex];
        Taro.showModal({
          title: '取消求助',
          content: `确定要取消求助吗？取消原因：${reason}`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              cancelHelper(helper.id, reason);
              Taro.showToast({ title: '已取消', icon: 'success' });
            }
          }
        });
      }
    });
  };

  const handleContact = () => {
    Taro.showModal({
      title: '隐私保护联系',
      content: '为保护双方隐私，系统将为您生成临时联系电话。\n\n对方号码：170-****-1234（虚拟号）\n有效期：2小时\n\n请文明沟通，恶意骚扰将被封号。',
      confirmText: '拨打虚拟号',
      success: (res) => {
        if (res.confirm) {
          Taro.makePhoneCall({ phoneNumber: '17012341234' }).catch(() => {
            Taro.showToast({ title: '已生成虚拟号', icon: 'none' });
          });
        }
      }
    });
  };

  const handleReport = () => {
    Taro.navigateTo({ url: `/pages/report/index?targetType=request&targetId=${helper.id}` });
  };

  const handleSendMessage = () => {
    const text = messageText.trim();
    if (!text) return;
    if (helper.status === 'cancelled' || helper.status === 'completed') {
      Taro.showToast({ title: '当前状态无法留言', icon: 'none' });
      return;
    }
    setSending(true);
    const newMsg: HelperMessage = {
      id: generateId(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: text,
      createdAt: new Date().toISOString()
    };
    setTimeout(() => {
      addMessage(helper.id, newMsg);
      setMessageText('');
      setSending(false);
    }, 200);
  };

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.headerCard}>
        <View className={styles.tagsRow}>
          {typeMeta && (
            <View className={styles.tag} style={{ background: typeMeta.bgColor, color: typeMeta.color }}>
              {typeMeta.label}
            </View>
          )}
          {urgentMeta && (
            <View className={styles.tag} style={{ background: urgentMeta.bgColor, color: urgentMeta.color }}>
              {urgentMeta.label}
            </View>
          )}
          {statusMeta && (
            <View className={styles.statusTag} style={{ background: statusMeta.bgColor, color: statusMeta.color }}>
              {statusMeta.label}
            </View>
          )}
        </View>
        <View className={styles.title}>{helper.title}</View>
        <View className={styles.desc}>{helper.description}</View>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>📍 地址</Text>
            <Text className={styles.infoValue}>
              {helper.building}
              {helper.unit} {helper.addressDetail}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>🚶 距离</Text>
            <Text className={styles.infoValue}>{formatDistance(helper.distance)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>⏰ 开始</Text>
            <Text className={styles.infoValue}>{formatDateTime(helper.startTime)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>⏱️ 截止</Text>
            <Text className={styles.infoValue}>{formatDateTime(helper.endTime)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>👥 可响应</Text>
            <Text className={styles.infoValue}>
              {helper.responders.length}/{helper.maxResponders}人
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>📅 发布</Text>
            <Text className={styles.infoValue}>{formatTime(helper.createdAt)}</Text>
          </View>
        </View>
      </View>

      {helper.cancelReason && (
        <View className={styles.cancelReason}>
          <Text className={styles.cancelLabel}>取消原因</Text>
          <Text className={styles.cancelText}>{helper.cancelReason}</Text>
        </View>
      )}

      <View className={styles.rewardCard}>
        <View className={styles.rewardIcon}>🎁</View>
        <View className={styles.rewardContent}>
          <Text className={styles.rewardLabel}>酬谢方式</Text>
          <Text className={styles.rewardValue}>{helper.rewardDetail}</Text>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>互助进度</View>
        <View className={styles.progressTimeline}>
          {progressSteps.map((step) => (
            <View key={step.key} className={styles.timelineItem}>
              <View className={classnames(styles.timelineDot, step.done ? styles.done : styles.pending)} />
              <View className={styles.timelineContent}>
                <Text className={styles.timelineTitle}>{step.title}</Text>
                <Text className={styles.timelineDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>发布人</View>
        <View className={styles.publisherRow}>
          <Image className={styles.avatar} src={helper.publisher.avatar} mode='aspectFill' />
          <View className={styles.publisherInfo}>
            <View className={styles.publisherName}>{helper.publisher.name}</View>
            <View className={styles.publisherMeta}>
              <Text>
                {helper.publisher.building}
                {helper.publisher.unit}
              </Text>
              <View className={styles.creditBadge}>⭐ {helper.publisher.creditScore}分</View>
              <Text>已帮{helper.publisher.helpedCount}次</Text>
            </View>
          </View>
          {!isPublisher && helper.status !== 'cancelled' && helper.status !== 'completed' && (
            <Button className={styles.contactBtn} onClick={handleContact}>
              📞 联系
            </Button>
          )}
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>响应邻居 ({helper.responders.length})</View>
        {helper.responders.length > 0 ? (
          <View className={styles.responderList}>
            {helper.responders.map((r) => (
              <View key={r.id} className={styles.responderItem}>
                <Image className={styles.respAvatar} src={r.avatar} mode='aspectFill' />
                <View className={styles.respInfo}>
                  <View className={styles.respName}>{r.name}</View>
                  <View className={styles.respMeta}>
                    {r.building}
                    {r.unit} · ⭐{r.creditScore}分 · 已帮{r.helpedCount}次
                  </View>
                </View>
                {helper.acceptedUserId === r.id ? (
                  <View className={styles.acceptBadge}>✓ 已确认</View>
                ) : isPublisher && helper.status === 'pending' && helper.responders.length > 0 ? (
                  <Button className={styles.acceptBtn} onClick={() => handleAcceptResponder(r.id)}>
                    确认TA
                  </Button>
                ) : null}
                {!isPublisher &&
                  r.id !== currentUser.id &&
                  helper.status !== 'cancelled' &&
                  helper.status !== 'completed' && (
                    <Button className={styles.contactBtn} style={{ height: 56, fontSize: 22 }} onClick={handleContact}>
                      联系
                    </Button>
                  )}
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            emoji='🙋'
            title='暂无邻居响应'
            text={isPublisher ? '耐心等待，或分享给更多邻居看看' : '愿意帮忙的话点击下方报名按钮吧~'}
          />
        )}
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>留言交流 ({helper.messages.length})</View>
        <View className={styles.messageList}>
          {helper.messages.length > 0 ? (
            helper.messages.map((msg) =>
              msg.isSystem ? (
                <View key={msg.id} className={styles.systemMsg}>
                  {msg.content}
                </View>
              ) : (
                <View key={msg.id} className={styles.messageItem}>
                  <Image className={styles.msgAvatar} src={msg.userAvatar} mode='aspectFill' />
                  <View className={styles.msgContent}>
                    <View className={styles.msgHeader}>
                      <Text className={styles.msgName}>{msg.userName}</Text>
                      <Text className={styles.msgTime}>{formatTime(msg.createdAt)}</Text>
                    </View>
                    <View className={styles.msgText}>{msg.content}</View>
                  </View>
                </View>
              )
            )
          ) : (
            <EmptyState emoji='💬' title='还没有留言' text='留言和邻居沟通一下吧' />
          )}
        </View>
        {helper.status !== 'cancelled' && helper.status !== 'completed' && (
          <View className={styles.messageInputBar}>
            <Input
              className={styles.msgInput}
              placeholder='说点什么...'
              value={messageText}
              onInput={(e) => setMessageText(e.detail.value)}
              confirmType='send'
              onConfirm={handleSendMessage}
              maxlength={200}
            />
            <Button
              className={classnames(styles.sendBtn, !messageText.trim() && styles.disabled)}
              onClick={handleSendMessage}
              loading={sending}
              disabled={!messageText.trim() || sending}
            >
              发送
            </Button>
          </View>
        )}
      </View>

      <View style={{ padding: '0 32rpx' }}>
        <View
          onClick={handleReport}
          style={{ textAlign: 'center', padding: '24rpx', fontSize: 24, color: '#9C8A8A' }}
        >
          发现违规？点击举报 🚨
        </View>
      </View>

      <View className={styles.footer}>
        {isPublisher ? (
          <>
            {(helper.status === 'pending' || helper.status === 'accepted') && (
              <Button className={styles.btnSecondary} onClick={handleCancel}>
                取消求助
              </Button>
            )}
            {helper.status === 'accepted' && (
              <Button className={styles.btnPrimary} onClick={handleStart}>
                开始互助
              </Button>
            )}
            {helper.status === 'in_progress' && (
              <Button className={classnames(styles.btnPrimary, styles.success)} onClick={handleComplete}>
                ✓ 确认完成
              </Button>
            )}
            {(helper.status === 'completed' || helper.status === 'cancelled') && (
              <Button
                className={classnames(styles.btnPrimary, styles.success)}
                style={{ flex: 1 }}
                onClick={() => Taro.switchTab({ url: '/pages/publish/index' })}
              >
                再次发布
              </Button>
            )}
          </>
        ) : (
          <>
            {helper.status === 'pending' && !isResponder && (
              <Button
                className={classnames(styles.btnPrimary)}
                onClick={handleSignUp}
                disabled={helper.responders.length >= helper.maxResponders}
              >
                {helper.responders.length >= helper.maxResponders ? '人数已满' : '🙋 我要帮忙'}
              </Button>
            )}
            {isResponder &&
              helper.status === 'accepted' &&
              helper.acceptedUserId === currentUser.id && (
                <Button className={classnames(styles.btnPrimary, styles.success)} onClick={handleStart}>
                  我已就位，开始！
                </Button>
              )}
            {isResponder &&
              helper.acceptedUserId === currentUser.id &&
              helper.status === 'in_progress' && (
                <Button className={classnames(styles.btnPrimary, styles.success)} onClick={handleComplete}>
                  ✓ 我已完成
                </Button>
              )}
            {isResponder && helper.acceptedUserId !== currentUser.id && (
              <Button
                className={classnames(styles.btnPrimary, styles.disabled)}
                disabled
                style={{ flex: 1 }}
              >
                已报名，等待确认
              </Button>
            )}
            {(helper.status === 'completed' || helper.status === 'cancelled') && !isResponder && (
              <Button
                className={styles.btnPrimary}
                style={{ flex: 1 }}
                onClick={() => Taro.switchTab({ url: '/pages/home/index' })}
              >
                返回广场
              </Button>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default DetailPage;
