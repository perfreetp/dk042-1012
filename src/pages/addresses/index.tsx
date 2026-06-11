import React, { useState } from 'react';
import { View, Text, Input, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import type { AddressItem } from '@/types';
import styles from './index.module.scss';

const AddressesPage: React.FC = () => {
  const addresses = useAppStore((s) => s.addresses);
  const addAddress = useAppStore((s) => s.addAddress);
  const updateAddress = useAppStore((s) => s.updateAddress);
  const deleteAddress = useAppStore((s) => s.deleteAddress);
  const setDefaultAddress = useAppStore((s) => s.setDefaultAddress);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [building, setBuilding] = useState('');
  const [unit, setUnit] = useState('');
  const [room, setRoom] = useState('');
  const [detail, setDetail] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setBuilding('');
    setUnit('');
    setRoom('');
    setDetail('');
    setIsDefault(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item: AddressItem) => {
    setEditingId(item.id);
    setBuilding(item.building);
    setUnit(item.unit);
    setRoom(item.room);
    setDetail(item.detail || '');
    setIsDefault(item.isDefault);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!building.trim()) {
      Taro.showToast({ title: '请填写楼栋号', icon: 'none' });
      return;
    }
    if (!unit.trim()) {
      Taro.showToast({ title: '请填写单元号', icon: 'none' });
      return;
    }
    if (!room.trim()) {
      Taro.showToast({ title: '请填写房间号', icon: 'none' });
      return;
    }

    if (editingId) {
      updateAddress(editingId, {
        building: building.trim(),
        unit: unit.trim(),
        room: room.trim(),
        detail: detail.trim(),
        isDefault
      });
      Taro.showToast({ title: '地址已更新', icon: 'success' });
    } else {
      addAddress({
        building: building.trim(),
        unit: unit.trim(),
        room: room.trim(),
        detail: detail.trim(),
        isDefault
      });
      Taro.showToast({ title: '地址已添加', icon: 'success' });
    }

    handleClose();
  };

  const handleSetDefault = (id: string) => {
    setDefaultAddress(id);
    Taro.showToast({ title: '已设为默认', icon: 'success' });
  };

  const handleDelete = (item: AddressItem) => {
    if (item.isDefault) {
      Taro.showToast({ title: '默认地址无法删除', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      confirmColor: '#FF7A45',
      success: (res) => {
        if (res.confirm) {
          deleteAddress(item.id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      {addresses.length > 0 ? (
        <View className={styles.list}>
          {addresses.map((addr) => (
            <View key={addr.id} className={styles.addrItem}>
              <View className={styles.addrHeader}>
                {addr.isDefault && <View className={styles.defaultTag}>默认</View>}
                <View className={styles.addrTitle}>
                  {addr.building} {addr.unit} {addr.room}
                </View>
              </View>
              <View className={styles.addrDetail}>
                {addr.building}栋 {addr.unit}单元 {addr.room}室
              </View>
              {addr.detail && <View className={styles.addrRemark}>备注：{addr.detail}</View>}
              <View className={styles.addrActions}>
                <View
                  className={[styles.actionItem, !addr.isDefault && styles.setDefault].join(' ')}
                  onClick={() => !addr.isDefault && handleSetDefault(addr.id)}
                >
                  <Text className={styles.actionIcon}>{addr.isDefault ? '✓' : '☆'}</Text>
                  <Text>{addr.isDefault ? '默认地址' : '设为默认'}</Text>
                </View>
                <View
                  className={[styles.actionItem, styles.editAction].join(' ')}
                  onClick={() => handleEdit(addr)}
                >
                  <Text className={styles.actionIcon}>✏️</Text>
                  <Text>编辑</Text>
                </View>
                <View className={styles.actionItem} onClick={() => handleDelete(addr)}>
                  <Text className={styles.actionIcon}>🗑️</Text>
                  <Text>删除</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyWrap}>
          <EmptyState emoji='📍' title='还没有添加地址' text='添加常用地址，发布求助更方便~' />
        </View>
      )}

      <View className={styles.bottomBar}>
        <View className={styles.addBtn} onClick={handleAdd}>
          + 新增地址
        </View>
      </View>

      {showModal && (
        <View className={styles.modalMask} onClick={handleClose}>
          <View className={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>{editingId ? '编辑地址' : '新增地址'}</Text>
              <View className={styles.modalClose} onClick={handleClose}>
                ✕
              </View>
            </View>

            <View className={styles.tripleRow}>
              <View className={[styles.formRow, styles.tripleItem].join(' ')}>
                <View className={[styles.formLabel, styles.required].join(' ')}>楼栋</View>
                <View className={styles.inputWrap}>
                  <Input
                    className={styles.inputField}
                    placeholder='如：12'
                    value={building}
                    onInput={(e) => setBuilding(e.detail.value)}
                  />
                </View>
              </View>
              <View className={[styles.formRow, styles.tripleItem].join(' ')}>
                <View className={[styles.formLabel, styles.required].join(' ')}>单元</View>
                <View className={styles.inputWrap}>
                  <Input
                    className={styles.inputField}
                    placeholder='如：2'
                    value={unit}
                    onInput={(e) => setUnit(e.detail.value)}
                  />
                </View>
              </View>
              <View className={[styles.formRow, styles.tripleItem].join(' ')}>
                <View className={[styles.formLabel, styles.required].join(' ')}>房间</View>
                <View className={styles.inputWrap}>
                  <Input
                    className={styles.inputField}
                    placeholder='如：1602'
                    value={room}
                    onInput={(e) => setRoom(e.detail.value)}
                  />
                </View>
              </View>
            </View>

            <View className={styles.formRow}>
              <View className={styles.formLabel}>详细备注（选填）</View>
              <View className={styles.inputWrap}>
                <Input
                  className={styles.inputField}
                  placeholder='如：门前有脚垫、门禁密码等'
                  value={detail}
                  onInput={(e) => setDetail(e.detail.value)}
                />
              </View>
            </View>

            <View className={styles.switchRow}>
              <Text className={styles.switchLabel}>设为默认地址</Text>
              <Switch checked={isDefault} color='#FF7A45' onChange={(e) => setIsDefault(e.detail.value)} />
            </View>

            <View className={styles.modalFooter}>
              <View className={styles.cancelBtn} onClick={handleClose}>
                取消
              </View>
              <View className={styles.submitBtn} onClick={handleSubmit}>
                {editingId ? '保存修改' : '确认添加'}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AddressesPage;
