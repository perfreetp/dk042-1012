import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Picker } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import type { HelperType, UrgentLevel, RewardType, AddressItem } from '@/types';
import { helperTypeList, urgentLevelList, rewardTypeList, generateId } from '@/utils';
import { currentUser } from '@/data/notices';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

const PublishPage: React.FC = () => {
  const addHelper = useAppStore((s) => s.addHelper);
  const addresses = useAppStore((s) => s.addresses);
  const getDefaultAddress = useAppStore((s) => s.getDefaultAddress);

  const [type, setType] = useState<HelperType>('express');
  const [urgentLevel, setUrgentLevel] = useState<UrgentLevel>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState(dayjs().add(1, 'hour').format('HH:mm'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [endTime, setEndTime] = useState(dayjs().add(3, 'hour').format('HH:mm'));
  const [rewardType, setRewardType] = useState<RewardType>('free');
  const [rewardDetail, setRewardDetail] = useState('邻里互助，感谢帮忙~');
  const [building, setBuilding] = useState('');
  const [unit, setUnit] = useState('');
  const [room, setRoom] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [maxResponders, setMaxResponders] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddrId, setSelectedAddrId] = useState<string | undefined>();

  const applyAddress = (addr: AddressItem) => {
    setBuilding(addr.building);
    setUnit(addr.unit);
    setRoom(addr.room);
    setAddressDetail(addr.detail);
    setSelectedAddrId(addr.id);
  };

  useDidShow(() => {
    const def = getDefaultAddress();
    if (def) {
      applyAddress(def);
    }
  });

  const isFormValid = () => {
    return (
      type &&
      urgentLevel &&
      title.trim() &&
      description.trim() &&
      startDate &&
      startTime &&
      endDate &&
      endTime &&
      rewardType &&
      building &&
      unit
    );
  };

  const handleChangeMaxResp = (delta: number) => {
    const next = Math.max(1, Math.min(10, maxResponders + delta));
    setMaxResponders(next);
  };

  const handleChooseAddress = () => {
    if (addresses.length === 0) {
      Taro.showActionSheet({
        itemList: ['去添加常用地址'],
        success: () => {
          Taro.navigateTo({ url: '/pages/addresses/index' });
        }
      });
      return;
    }
    const list = addresses.map((a) => {
      const tag = a.isDefault ? '[默认] ' : '';
      return `${tag}${a.building}${a.unit}${a.room}${a.detail ? ' · ' + a.detail : ''}`;
    });
    list.push('手动输入新地址');
    Taro.showActionSheet({
      itemList: list,
      success: (res) => {
        if (res.tapIndex === list.length - 1) {
          setSelectedAddrId(undefined);
          setBuilding('');
          setUnit('');
          setRoom('');
          setAddressDetail('');
        } else {
          applyAddress(addresses[res.tapIndex]);
        }
      }
    });
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    if (dayjs(`${startDate} ${startTime}`).isAfter(dayjs(`${endDate} ${endTime}`))) {
      Taro.showToast({ title: '结束时间需晚于开始时间', icon: 'none' });
      return;
    }

    setSubmitting(true);

    const newHelper = {
      id: generateId(),
      type,
      title: title.trim(),
      description: description.trim(),
      urgentLevel,
      status: 'pending' as const,
      publisherId: currentUser.id,
      publisher: currentUser,
      building,
      unit,
      addressDetail: `${room}${addressDetail ? ' ' + addressDetail : ''}`,
      distance: 0,
      startTime: dayjs(`${startDate} ${startTime}`).toISOString(),
      endTime: dayjs(`${endDate} ${endTime}`).toISOString(),
      rewardType,
      rewardDetail:
        rewardDetail || rewardTypeList.find((r) => r.key === rewardType)?.label || '',
      maxResponders,
      responders: [],
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addHelper(newHelper);

    setTimeout(() => {
      setSubmitting(false);
      Taro.showToast({ title: '发布成功！', icon: 'success' });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' });
      }, 800);
    }, 500);
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要放弃编辑吗？已填写内容将丢失',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({ url: '/pages/home/index' });
        }
      }
    });
  };

  const typeMeta = helperTypeList.find((t) => t.key === type)!;
  const urgentMeta = urgentLevelList.find((u) => u.key === urgentLevel)!;

  const selectedAddrText =
    selectedAddrId && addresses.find((a) => a.id === selectedAddrId)
      ? `${building}${unit}${room}${addressDetail ? ' · ' + addressDetail : ''}`
      : '';

  return (
    <View className={styles.page}>
      <View className={styles.formCard}>
        <View className={styles.formTitle}>选择求助类型</View>
        <View className={styles.typeGrid}>
          {helperTypeList.map((item) => (
            <View
              key={item.key}
              className={classnames(styles.typeCard, type === item.key && styles.active)}
              onClick={() => setType(item.key)}
            >
              <View className={styles.typeIcon} style={{ background: item.bgColor }}>
                <Text>
                  {item.key === 'express' && '📦'}
                  {item.key === 'care' && '👶'}
                  {item.key === 'move' && '📦'}
                  {item.key === 'tool' && '🔧'}
                  {item.key === 'run' && '🏃'}
                </Text>
              </View>
              <Text className={styles.typeLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formTitle}>紧急程度</View>
        <View className={styles.urgentRow}>
          {urgentLevelList.map((item) => (
            <View
              key={item.key}
              className={classnames(styles.urgentCard, urgentLevel === item.key && styles.active)}
              style={{
                background: urgentLevel === item.key ? item.bgColor : undefined,
                borderColor: urgentLevel === item.key ? item.color : undefined
              }}
              onClick={() => setUrgentLevel(item.key)}
            >
              <Text
                className={styles.urgentLabel}
                style={{ color: urgentLevel === item.key ? item.color : undefined }}
              >
                {item.label}
              </Text>
              <Text
                className={styles.urgentDesc}
                style={{ color: urgentLevel === item.key ? item.color : undefined }}
              >
                {item.key === 'high' && '30分钟内'}
                {item.key === 'medium' && '2小时内'}
                {item.key === 'low' && '今日内'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formTitle}>求助信息</View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>求助标题</Text>
          <View className={styles.inputWrap}>
            <Input
              className={styles.input}
              placeholder='一句话描述你的需求'
              value={title}
              onInput={(e) => setTitle(e.detail.value.slice(0, 30))}
              maxlength={30}
            />
          </View>
          <View className={styles.wordCount}>{title.length}/30</View>
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>详细描述</Text>
          <View className={styles.textareaWrap}>
            <Textarea
              className={styles.textarea}
              placeholder='请详细描述你的需求，包括物品大小、注意事项等...'
              value={description}
              onInput={(e) => setDescription(e.detail.value.slice(0, 500))}
              maxlength={500}
              autoHeight
            />
          </View>
          <View className={styles.wordCount}>{description.length}/500</View>
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>期望时间</Text>
          <View className={styles.dateRow}>
            <View className={styles.dateItem}>
              <Picker mode='date' value={startDate} onChange={(e) => setStartDate(e.detail.value)}>
                <View className={styles.inputWrap}>
                  <Text style={{ color: startDate ? undefined : '$color-text-tertiary' }}>
                    {startDate || '开始日期'}
                  </Text>
                </View>
              </Picker>
            </View>
            <View className={styles.dateItem}>
              <Picker mode='time' value={startTime} onChange={(e) => setStartTime(e.detail.value)}>
                <View className={styles.inputWrap}>
                  <Text>{startTime || '开始时间'}</Text>
                </View>
              </Picker>
            </View>
          </View>
          <View style={{ height: 16 }} />
          <View className={styles.dateRow}>
            <View className={styles.dateItem}>
              <Picker mode='date' value={endDate} onChange={(e) => setEndDate(e.detail.value)}>
                <View className={styles.inputWrap}>
                  <Text>{endDate || '结束日期'}</Text>
                </View>
              </Picker>
            </View>
            <View className={styles.dateItem}>
              <Picker mode='time' value={endTime} onChange={(e) => setEndTime(e.detail.value)}>
                <View className={styles.inputWrap}>
                  <Text>{endTime || '结束时间'}</Text>
                </View>
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formTitle}>地址信息</View>

        {addresses.length > 0 && (
          <View className={styles.formItem}>
            <Text className={styles.label}>选择已有地址</Text>
            <View className={styles.addressCard} onClick={handleChooseAddress}>
              <View className={styles.addressIcon}>📍</View>
              <View className={styles.addressContent}>
                <View className={styles.addressMain}>
                  {selectedAddrText || '点击选择常用地址'}
                </View>
                <View className={styles.addressSub}>已保存 {addresses.length} 个地址</View>
              </View>
              <Text className={styles.addressArrow}>›</Text>
            </View>
          </View>
        )}

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>楼栋/单元/室号</Text>
          <View className={styles.dateRow}>
            <View className={styles.dateItem}>
              <View className={styles.inputWrap}>
                <Input
                  className={styles.input}
                  placeholder='如：3栋'
                  value={building}
                  onInput={(e) => setBuilding(e.detail.value)}
                />
              </View>
            </View>
            <View className={styles.dateItem}>
              <View className={styles.inputWrap}>
                <Input
                  className={styles.input}
                  placeholder='如：2单元'
                  value={unit}
                  onInput={(e) => setUnit(e.detail.value)}
                />
              </View>
            </View>
            <View className={styles.dateItem}>
              <View className={styles.inputWrap}>
                <Input
                  className={styles.input}
                  placeholder='室号'
                  value={room}
                  onInput={(e) => setRoom(e.detail.value)}
                />
              </View>
            </View>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>补充说明（选填）</Text>
          <View className={styles.inputWrap}>
            <Input
              className={styles.input}
              placeholder='如：门口有红色脚垫'
              value={addressDetail}
              onInput={(e) => setAddressDetail(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formTitle}>酬谢方式</View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>酬谢类型</Text>
          <View className={styles.rewardRow}>
            {rewardTypeList.map((item) => (
              <View
                key={item.key}
                className={classnames(styles.rewardCard, rewardType === item.key && styles.active)}
                onClick={() => setRewardType(item.key)}
              >
                {item.label}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>具体说明</Text>
          <View className={styles.inputWrap}>
            <Input
              className={styles.input}
              placeholder={
                rewardType === 'money'
                  ? '如：20元辛苦费'
                  : rewardType === 'gift'
                  ? '如：一份小礼物'
                  : rewardType === 'exchange'
                  ? '如：下次我帮你取快递'
                  : '如：邻里互助，感谢！'
              }
              value={rewardDetail}
              onInput={(e) => setRewardDetail(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.label, styles.required)}>可接受人数</Text>
          <View className={styles.maxRespRow}>
            <View className={styles.stepperWrap}>
              <Button
                className={styles.stepperBtn}
                onClick={() => handleChangeMaxResp(-1)}
                disabled={maxResponders <= 1}
              >
                −
              </Button>
              <Text className={styles.stepperInput}>{maxResponders}</Text>
              <Button
                className={styles.stepperBtn}
                onClick={() => handleChangeMaxResp(1)}
                disabled={maxResponders >= 10}
              >
                +
              </Button>
            </View>
            <Text className={styles.respTip}>最多可接受 {maxResponders} 位邻居帮忙</Text>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </Button>
        <Button
          className={classnames(styles.submitBtn, !isFormValid() && styles.disabled)}
          loading={submitting}
          disabled={submitting || !isFormValid()}
          onClick={handleSubmit}
        >
          {submitting ? '发布中...' : '立即发布求助'}
        </Button>
      </View>
    </View>
  );
};

export default PublishPage;
