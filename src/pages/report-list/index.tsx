import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import { currentUser } from '@/data/notices';
import { formatTime } from '@/utils';
import styles from './index.module.scss';

type TabType = 'all' | 'pending' | 'processed' | 'rejected';

const tabList: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '处理中' },
  { key: 'processed', label: '已处理' },
  { key: 'rejected', label: '已驳回' }
];

const ReportListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const allReports = useAppStore((s) => s.reports);

  const myReports = useMemo(
    () => allReports.filter((r) => r.reporterId === currentUser.id),
    [allReports]
  );

  const filteredReports = useMemo(() => {
    if (activeTab === 'all') return myReports;
    return myReports.filter((r) => r.status === activeTab);
  }, [myReports, activeTab]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '处理中', class: styles.pendingTag };
      case 'processed':
        return { label: '已处理', class: styles.processedTag };
      case 'rejected':
        return { label: '已驳回', class: styles.rejectedTag };
      default:
        return { label: '未知', class: styles.pendingTag };
    }
  };

  const handleGoReport = () => {
    Taro.navigateTo({ url: '/pages/report/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        {tabList.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tab, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.list}>
        {filteredReports.length > 0 ? (
          filteredReports.map((r) => {
            const statusInfo = getStatusInfo(r.status);
            return (
              <View key={r.id} className={styles.card}>
                <View className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>
                    {r.targetType === 'request' ? '求助举报' : '用户举报'}
                  </Text>
                  <View className={[styles.statusTag, statusInfo.class].join(' ')}>
                    {statusInfo.label}
                  </View>
                </View>

                <View className={styles.metaRow}>
                  <Text className={styles.metaItem}>
                    <Text className={styles.metaLabel}>举报原因：</Text>
                    {r.reason}
                  </Text>
                </View>

                <View className={styles.metaRow}>
                  <Text className={styles.metaItem}>
                    <Text className={styles.metaLabel}>举报时间：</Text>
                    {formatTime(r.createdAt)}
                  </Text>
                </View>

                <View className={styles.sectionLabel}>原始举报内容</View>
                <View className={styles.desc}>{r.detail}</View>

                {r.status !== 'pending' && (
                  <View
                    className={[
                      styles.resultBox,
                      r.status === 'processed' ? styles.resultProcessed : styles.resultRejected
                    ].join(' ')}
                  >
                    <Text className={styles.resultLabel}>
                      {r.status === 'processed' ? '✅ 管理员处理结果' : 'ℹ️ 管理员驳回说明'}
                    </Text>
                    <Text className={styles.resultText}>
                      {r.handleNote || (r.status === 'processed' ? '已按社区规则进行相应处置' : '经核查举报内容不属实或证据不足')}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View className={styles.emptyWrap}>
            <EmptyState
              emoji='📋'
              title={activeTab === 'all' ? '暂无举报记录' : '该状态下暂无记录'}
              text={activeTab === 'all' ? '发现违规行为可以随时举报~' : '切换其他状态看看'}
              showBtn={activeTab === 'all'}
              btnText='去举报'
              onBtnClick={handleGoReport}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ReportListPage;
