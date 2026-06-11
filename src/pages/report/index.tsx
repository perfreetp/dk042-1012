import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

const reasonOptions = [
  { key: 'spam', label: '垃圾广告/营销' },
  { key: 'fake', label: '虚假信息' },
  { key: 'harass', label: '骚扰/辱骂' },
  { key: 'fraud', label: '涉嫌诈骗' },
  { key: 'violence', label: '暴力/色情' },
  { key: 'privacy', label: '侵犯隐私' },
  { key: 'rule', label: '违反互助规则' },
  { key: 'other', label: '其他原因' }
];

const ReportPage: React.FC = () => {
  const router = useRouter();
  const addReport = useAppStore((s) => s.addReport);
  const currentUser = useAppStore((s) => s.currentUser);
  const [reportType, setReportType] = useState('');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [contact, setContact] = useState('');

  useDidShow(() => {
    const targetType = router.params.targetType || 'user';
    setReportType(targetType === 'notice' ? '社区公告' : targetType === 'request' ? '求助内容' : '用户行为');
    if (router.params.targetId) {
      setTargetId(router.params.targetId);
    }
  });

  const getTypeLabel = () => reportType || '请选择';

  const handleSelectType = () => {
    Taro.showActionSheet({
      itemList: ['用户行为', '求助内容', '社区公告', '评论内容'],
      success: (res) => {
        const types = ['用户行为', '求助内容', '社区公告', '评论内容'];
        setReportType(types[res.tapIndex]);
      }
    });
  };

  const handleSelectTarget = () => {
    Taro.showToast({ title: '已自动关联举报对象', icon: 'none' });
  };

  const handleUpload = () => {
    Taro.showToast({ title: '图片上传功能开发中', icon: 'none' });
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const handleSubmit = () => {
    if (!reportType) {
      Taro.showToast({ title: '请选择举报类型', icon: 'none' });
      return;
    }
    if (!reason) {
      Taro.showToast({ title: '请选择举报原因', icon: 'none' });
      return;
    }
    if (!detail.trim()) {
      Taro.showToast({ title: '请补充详细描述', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '提交中...', mask: true });
    setTimeout(() => {
      Taro.hideLoading();

      const reasonLabel = reasonOptions.find((o) => o.key === reason)?.label || reason;
      addReport({
        reporterId: currentUser.id,
        targetId: targetId || 'target-' + Date.now(),
        targetType: reportType === '求助内容' ? 'request' : 'user',
        reason: reasonLabel,
        detail: detail.trim() + (contact ? `\n\n联系方式：${contact}` : ''),
        images: []
      });

      Taro.showModal({
        title: '举报提交成功',
        content: '我们已收到您的举报，管理员将在24小时内进行核实处理。感谢您为社区和谐贡献力量！',
        showCancel: false,
        confirmColor: '#FF7A45',
        success: () => {
          Taro.navigateBack();
        }
      });
    }, 1000);
  };

  return (
    <View className={styles.page}>
      <View className={styles.tipCard}>
        <View className={styles.tipTitle}>
          <Text>⚠️</Text>
          <Text>请如实填写举报信息</Text>
        </View>
        <View className={styles.tipText}>
          恶意举报将扣除信用积分并承担相应责任。我们会严格保密您的个人信息，请放心举报。
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.formRow} onClick={handleSelectType}>
          <View className={[styles.formLabel, styles.formLabelRequired].join(' ')}>举报类型</View>
          <View className={[styles.formValue, !reportType && styles.placeholder].join(' ')}>
            {getTypeLabel()}
          </View>
          <Text className={styles.arrow}>›</Text>
        </View>
        <View className={styles.formRow} onClick={handleSelectTarget}>
          <View className={[styles.formLabel, styles.formLabelRequired].join(' ')}>举报对象</View>
          <View className={styles.formValue}>
            {targetId ? `已关联 ID: ${targetId.slice(-6)}` : '自动关联当前内容'}
          </View>
          <Text className={styles.arrow}>›</Text>
        </View>
      </View>

      <View style={{ padding: '24px 24px 8px', fontSize: '28px', fontWeight: '600', color: '#333' }}>
        <Text style={{ color: '#F53F3F' }}>*</Text> 选择举报原因
      </View>

      <View className={styles.reasonGrid}>
        {reasonOptions.map(opt => (
          <View
            key={opt.key}
            className={classnames(styles.reasonItem, reason === opt.key && styles.reasonSelected)}
            onClick={() => setReason(opt.key)}
          >
            {opt.label}
          </View>
        ))}
      </View>

      <View className={styles.detailArea}>
        <View className={styles.textareaLabel}>
          <Text style={{ color: '#F53F3F' }}>*</Text> 详细描述
        </View>
        <Textarea
          className={styles.textareaBox}
          placeholder='请详细描述违规情况，包括时间、地点、具体行为等，有助于我们快速处理。建议50字以上。'
          value={detail}
          onInput={(e) => setDetail(e.detail.value)}
          maxlength={500}
        />
        <View style={{ marginTop: 12, textAlign: 'right', fontSize: 22, color: '#CCC' }}>
          {detail.length}/500
        </View>
      </View>

      <View className={styles.uploadSection}>
        <View className={styles.uploadTitle}>上传证据（选填）</View>
        <View className={styles.uploadTip}>支持上传聊天记录截图、相关图片等，最多9张</View>
        <View className={styles.uploadGrid} onClick={handleUpload}>
          <View className={styles.uploadItem}>
            <Text className={styles.uploadIcon}>+</Text>
            <Text className={styles.uploadText}>添加图片</Text>
          </View>
        </View>
      </View>

      <View className={styles.contactRow}>
        <View className={styles.contactTitle}>联系方式（选填）</View>
        <View className={styles.contactTip}>如需反馈处理结果，请留下您的联系方式</View>
        <Input
          className={styles.inputBox}
          placeholder='手机号或微信号'
          value={contact}
          onInput={(e) => setContact(e.detail.value)}
        />
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.cancelBtn} onClick={handleCancel}>取消</View>
        <View className={styles.submitBtn} onClick={handleSubmit}>提交举报</View>
      </View>
    </View>
  );
};

export default ReportPage;
