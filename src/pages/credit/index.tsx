import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import { mockCreditRecords, currentUser } from '@/data/notices';
import { formatDateTime } from '@/utils';
import styles from './index.module.scss';

const CreditPage: React.FC = () => {
  const records = mockCreditRecords;

  const gradeInfo = useMemo(() => {
    const score = currentUser.creditScore;
    let grade = '信用良好';
    if (score >= 100) grade = '优秀居民';
    else if (score >= 80) grade = '信用优秀';
    else if (score >= 60) grade = '信用良好';
    else if (score >= 40) grade = '信用一般';
    else grade = '需要提升';
    return { score, grade };
  }, []);

  const rules = [
    '完成一次互助 +2分，紧急互助额外 +3分',
    '获得感谢墙好评 +3分',
    '获得对方五星好评 +2分',
    '无故取消已响应的求助 -1分',
    '被举报并核实违规 -5至-20分',
    '连续7天无不良记录 +1分/周'
  ];

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <View className={styles.scoreCircle}>
          <View className={styles.scoreNum}>{gradeInfo.score}</View>
          <View className={styles.scoreLabel}>信用积分</View>
        </View>
        <View className={styles.gradeBadge}>🏆 {gradeInfo.grade}</View>
      </View>

      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <View className={styles.infoNum}>{currentUser.helpCount}</View>
          <View className={styles.infoLabel}>帮助邻居</View>
        </View>
        <View className={styles.infoItem}>
          <View className={styles.infoNum}>{currentUser.helpedCount}</View>
          <View className={styles.infoLabel}>被帮助</View>
        </View>
        <View className={styles.infoItem}>
          <View className={styles.infoNum}>{records.length}</View>
          <View className={styles.infoLabel}>信用记录</View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          信用明细
          <Text className={styles.tipText}>近30天</Text>
        </View>
        {records.length > 0 ? (
          <View className={styles.recordList}>
            {records.map(r => (
              <View key={r.id} className={styles.recordItem}>
                <View className={classnames(styles.recordIcon, r.type === 'plus' ? styles.plusBg : styles.minusBg)}>
                  <Text>{r.type === 'plus' ? '📈' : '📉'}</Text>
                </View>
                <View className={styles.recordContent}>
                  <View className={styles.recordReason}>{r.reason}</View>
                  <View className={styles.recordTime}>{formatDateTime(r.createdAt)}</View>
                </View>
                <View className={classnames(
                  styles.recordScore,
                  r.type === 'plus' ? styles.plusColor : styles.minusColor
                )}>
                  {r.type === 'plus' ? '+' : '-'}{r.score}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyRecord}>
            <View className={styles.emptyEmoji}>📋</View>
            <View className={styles.emptyText}>暂无信用记录</View>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          积分规则
        </View>
        <View className={styles.rules}>
          {rules.map((rule, idx) => (
            <View key={idx} className={styles.ruleItem}>
              • {rule}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default CreditPage;
