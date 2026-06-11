import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import { formatTime, helperTypeList } from '@/utils';
import styles from './index.module.scss';

type TabType = 'helpers' | 'reports';

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<TabType>('helpers');
  const helpers = useAppStore((s) => s.helpers);
  const reports = useAppStore((s) => s.reports);
  const approveHelper = useAppStore((s) => s.approveHelper);
  const rejectHelper = useAppStore((s) => s.rejectHelper);
  const processReport = useAppStore((s) => s.processReport);

  const pendingHelpers = useMemo(
    () => helpers.filter((h) => h.status === 'pending_review'),
    [helpers]
  );

  const getHelperTypeLabel = (type: string) => {
    const found = helperTypeList.find((t) => t.key === type);
    return found ? found.label : type;
  };

  const handleApproveHelper = (id: string, title: string) => {
    Taro.showModal({
      title: '确认通过',
      content: `确定通过求助「${title}」的审核？`,
      confirmColor: '#FF7A45',
      success: (res) => {
        if (res.confirm) {
          approveHelper(id);
          Taro.showToast({ title: '已通过审核', icon: 'success' });
        }
      }
    });
  };

  const handleRejectHelper = (id: string, title: string) => {
    Taro.showModal({
      title: '确认驳回',
      content: `确定驳回求助「${title}」？`,
      confirmColor: '#F53F3F',
      editable: true,
      placeholderText: '请输入驳回原因（选填）',
      success: (res) => {
        if (res.confirm) {
          rejectHelper(id, res.content || '内容不符合社区规范');
          Taro.showToast({ title: '已驳回', icon: 'success' });
        }
      }
    });
  };

  const handleProcessReport = (id: string, approved: boolean) => {
    const action = approved ? '确认处理' : '确认驳回';
    const content = approved
      ? '确定将该举报标记为已处理？相关违规内容已按规则处置。'
      : '确定驳回该举报？经核查举报内容不属实或证据不足。';
    Taro.showModal({
      title: action,
      content,
      confirmColor: approved ? '#FF7A45' : '#F53F3F',
      editable: true,
      placeholderText: '请输入处理备注（选填）',
      success: (res) => {
        if (res.confirm) {
          processReport(id, approved, res.content);
          Taro.showToast({
            title: approved ? '已处理' : '已驳回',
            icon: 'success'
          });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, tab === 'helpers' && styles.active)}
          onClick={() => setTab('helpers')}
        >
          待审核求助
          {pendingHelpers.length > 0 && <Text className={styles.badge}>{pendingHelpers.length}</Text>}
        </View>
        <View
          className={classnames(styles.tab, tab === 'reports' && styles.active)}
          onClick={() => setTab('reports')}
        >
          举报列表
          {reports.filter((r) => r.status === 'pending').length > 0 && (
            <Text className={styles.badge}>
              {reports.filter((r) => r.status === 'pending').length}
            </Text>
          )}
        </View>
      </View>

      <ScrollView scrollY className={styles.list}>
        {tab === 'helpers' ? (
          pendingHelpers.length > 0 ? (
            pendingHelpers.map((h) => (
              <View key={h.id} className={styles.card}>
                <View className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>{h.title}</Text>
                  <View className={[styles.typeTag, styles.pendingTag].join(' ')}>待审核</View>
                </View>
                <View className={styles.metaRow}>
                  <Text className={styles.metaItem}>
                    <Text className={styles.metaLabel}>类型：</Text>
                    {getHelperTypeLabel(h.type)}
                  </Text>
                  <Text className={styles.metaItem}>
                    <Text className={styles.metaLabel}>发布人：</Text>
                    {h.publisher.name}（{h.publisher.building}栋）
                  </Text>
                </View>
                <View className={styles.metaRow}>
                  <Text className={styles.metaItem}>
                    <Text className={styles.metaLabel}>地点：</Text>
                    {h.building}栋 {h.unit}单元 {h.addressDetail}
                  </Text>
                </View>
                <View className={styles.metaRow}>
                  <Text className={styles.metaItem}>
                    <Text className={styles.metaLabel}>时间：</Text>
                    {formatTime(h.createdAt)}
                  </Text>
                </View>
                <View className={styles.desc}>{h.description}</View>
                <View className={styles.actions}>
                  <View className={styles.rejectBtn} onClick={() => handleRejectHelper(h.id, h.title)}>
                    驳回
                  </View>
                  <View className={styles.approveBtn} onClick={() => handleApproveHelper(h.id, h.title)}>
                    通过
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyWrap}>
              <EmptyState emoji='✅' title='暂无待审核求助' text='所有求助都已审核完成~' />
            </View>
          )
        ) : reports.length > 0 ? (
          reports.map((r) => {
            const tagClass =
              r.status === 'pending'
                ? styles.pendingTag
                : r.status === 'processed'
                ? styles.processedTag
                : styles.rejectedTag;
            const tagLabel =
              r.status === 'pending' ? '待处理' : r.status === 'processed' ? '已处理' : '已驳回';
            return (
              <View key={r.id} className={styles.card}>
                <View className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>
                    {r.targetType === 'request' ? '求助举报' : '用户举报'}
                  </Text>
                  <View className={[styles.typeTag, tagClass].join(' ')}>{tagLabel}</View>
                </View>
                <View className={styles.metaRow}>
                  <Text className={styles.metaItem}>
                    <Text className={styles.metaLabel}>举报原因：</Text>
                    {r.reason}
                  </Text>
                </View>
                <View className={styles.metaRow}>
                  <Text className={styles.metaItem}>
                    <Text className={styles.metaLabel}>对象ID：</Text>
                    {r.targetId.slice(0, 8)}...
                  </Text>
                  <Text className={styles.metaItem}>
                    <Text className={styles.metaLabel}>举报时间：</Text>
                    {formatTime(r.createdAt)}
                  </Text>
                </View>
                <View className={styles.desc}>{r.detail}</View>
                {r.status === 'pending' && (
                  <View className={styles.actions}>
                    <View className={styles.rejectBtn} onClick={() => handleProcessReport(r.id, false)}>
                      驳回举报
                    </View>
                    <View className={styles.approveBtn} onClick={() => handleProcessReport(r.id, true)}>
                      确认处理
                    </View>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View className={styles.emptyWrap}>
            <EmptyState emoji='📋' title='暂无举报记录' text='社区秩序良好，继续保持~' />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AdminPage;
