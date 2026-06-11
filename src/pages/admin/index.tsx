import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import { formatTime, helperTypeList, getHelperStatusMeta } from '@/utils';
import styles from './index.module.scss';

type TabType = 'helpers' | 'reports';

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<TabType>('helpers');
  const helpers = useAppStore((s) => s.helpers);
  const reports = useAppStore((s) => s.reports);
  const approveHelper = useAppStore((s) => s.approveHelper);
  const rejectHelper = useAppStore((s) => s.rejectHelper);
  const reopenHelper = useAppStore((s) => s.reopenHelper);
  const processReport = useAppStore((s) => s.processReport);
  const reopenReport = useAppStore((s) => s.reopenReport);

  const pendingHelpers = useMemo(
    () => helpers.filter((h) => h.status === 'pending_review'),
    [helpers]
  );

  const handledHelpers = useMemo(
    () =>
      helpers.filter(
        (h) => h.status === 'pending' && h.auditLogs && h.auditLogs.length > 0
      ),
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

  const handleReopenHelper = (id: string, title: string) => {
    Taro.showModal({
      title: '重新审核',
      content: `确定将「${title}」重新提交审核？`,
      confirmColor: '#4C9AFF',
      success: (res) => {
        if (res.confirm) {
          reopenHelper(id);
          Taro.showToast({ title: '已重新提交审核', icon: 'success' });
        }
      }
    });
  };

  const handleProcessReport = (id: string, approved: boolean, currentStatus?: string) => {
    const isReProcess = currentStatus && currentStatus !== 'pending';
    const action = approved ? '确认处理' : '确认驳回';
    const content = isReProcess
      ? approved
        ? `原处理结果为「${currentStatus === 'processed' ? '已处理' : '已驳回'}」，确定改为「已处理」？`
        : `原处理结果为「${currentStatus === 'processed' ? '已处理' : '已驳回'}」，确定改为「已驳回」？`
      : approved
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

  const handleReopenReport = (id: string) => {
    Taro.showModal({
      title: '重新打开',
      content: '确定将该举报重新打开待处理？',
      confirmColor: '#4C9AFF',
      editable: true,
      placeholderText: '请输入重新打开原因（选填）',
      success: (res) => {
        if (res.confirm) {
          reopenReport(id, res.content);
          Taro.showToast({ title: '已重新打开', icon: 'success' });
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
          求助管理
          {pendingHelpers.length > 0 && <Text className={styles.badge}>{pendingHelpers.length}</Text>}
        </View>
        <View
          className={classnames(styles.tab, tab === 'reports' && styles.active)}
          onClick={() => setTab('reports')}
        >
          举报管理
          {reports.filter((r) => r.status === 'pending').length > 0 && (
            <Text className={styles.badge}>
              {reports.filter((r) => r.status === 'pending').length}
            </Text>
          )}
        </View>
      </View>

      <ScrollView scrollY className={styles.list}>
        {tab === 'helpers' ? (
          <View>
            {pendingHelpers.length > 0 && (
              <View className={styles.sectionBlock}>
                <View className={styles.sectionTitle}>待审核求助</View>
                {pendingHelpers.map((h) => {
                  const statusMeta = getHelperStatusMeta(h.status);
                  return (
                    <View key={h.id} className={styles.card}>
                      <View className={styles.cardHeader}>
                        <Text className={styles.cardTitle}>{h.title}</Text>
                        <View
                          className={[styles.typeTag, styles.pendingTag].join(' ')}
                          style={{ background: statusMeta.bgColor, color: statusMeta.color }}
                        >
                          {statusMeta.label}
                        </View>
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
                        <View
                          className={styles.rejectBtn}
                          onClick={() => handleRejectHelper(h.id, h.title)}
                        >
                          驳回
                        </View>
                        <View
                          className={styles.approveBtn}
                          onClick={() => handleApproveHelper(h.id, h.title)}
                        >
                          通过
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {handledHelpers.length > 0 && (
              <View className={styles.sectionBlock}>
                <View className={styles.sectionTitle}>已处理求助（可重新审核）</View>
                {handledHelpers.map((h) => {
                  const statusMeta = getHelperStatusMeta(h.status);
                  const lastLog = h.auditLogs && h.auditLogs[h.auditLogs.length - 1];
                  return (
                    <View key={h.id} className={styles.card}>
                      <View className={styles.cardHeader}>
                        <Text className={styles.cardTitle}>{h.title}</Text>
                        <View
                          className={[styles.typeTag, styles.processedTag].join(' ')}
                          style={{ background: statusMeta.bgColor, color: statusMeta.color }}
                        >
                          {statusMeta.label}
                        </View>
                      </View>
                      {lastLog && (
                        <View className={styles.auditHint}>
                          上次处理：{lastLog.operatorName} 于 {formatTime(lastLog.timestamp)}{' '}
                          {lastLog.action === 'approve' ? '通过' : '驳回'}
                          {lastLog.note && `（${lastLog.note}）`}
                        </View>
                      )}
                      <View className={styles.desc}>{h.description}</View>
                      <View className={styles.actions}>
                        <View
                          className={styles.reopenBtn}
                          onClick={() => handleReopenHelper(h.id, h.title)}
                        >
                          重新审核
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {pendingHelpers.length === 0 && handledHelpers.length === 0 && (
              <View className={styles.emptyWrap}>
                <EmptyState emoji='✅' title='暂无求助' text='所有求助都已处理完成~' />
              </View>
            )}
          </View>
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
            const lastHistory =
              r.processHistory && r.processHistory.length > 0
                ? r.processHistory[r.processHistory.length - 1]
                : null;
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

                {lastHistory && (
                  <View className={styles.auditHint}>
                    上次处理：{lastHistory.operatorName} 于 {formatTime(lastHistory.timestamp)}{' '}
                    {lastHistory.action === 'process'
                      ? '标记处理'
                      : lastHistory.action === 'reject'
                      ? '驳回举报'
                      : '重新打开'}
                    {lastHistory.note && `（${lastHistory.note}）`}
                  </View>
                )}

                {r.status === 'pending' ? (
                  <View className={styles.actions}>
                    <View
                      className={styles.rejectBtn}
                      onClick={() => handleProcessReport(r.id, false)}
                    >
                      驳回举报
                    </View>
                    <View
                      className={styles.approveBtn}
                      onClick={() => handleProcessReport(r.id, true)}
                    >
                      确认处理
                    </View>
                  </View>
                ) : (
                  <View className={styles.actions}>
                    <View
                      className={styles.reopenBtn}
                      onClick={() => handleReopenReport(r.id)}
                    >
                      重新打开
                    </View>
                    <View
                      className={styles.rejectBtn}
                      onClick={() => handleProcessReport(r.id, false, r.status)}
                    >
                      改为驳回
                    </View>
                    <View
                      className={styles.approveBtn}
                      onClick={() => handleProcessReport(r.id, true, r.status)}
                    >
                      改为处理
                    </View>
                  </View>
                )}

                {r.processHistory && r.processHistory.length > 1 && (
                  <View className={styles.historySection}>
                    <View className={styles.historyTitle}>处理历史</View>
                    {r.processHistory
                      .slice()
                      .reverse()
                      .map((h) => (
                        <View key={h.id} className={styles.historyItem}>
                          <Text className={styles.historyTime}>{formatTime(h.timestamp)}</Text>
                          <Text className={styles.historyContent}>
                            {h.operatorName} ·{' '}
                            {h.action === 'process'
                              ? '标记为已处理'
                              : h.action === 'reject'
                              ? '标记为已驳回'
                              : '重新打开待处理'}
                            {h.note && `：${h.note}`}
                          </Text>
                        </View>
                      ))}
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
