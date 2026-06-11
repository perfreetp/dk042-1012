import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import EmptyState from '@/components/EmptyState';
import { mockAddresses } from '@/data/notices';
import type { AddressItem } from '@/types';
import styles from './index.module.scss';

const AddressesPage: React.FC = () => {
  const [list, setList] = useState<AddressItem[]>(mockAddresses);

  const handleSetDefault = (id: string) => {
    setList(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    Taro.showToast({ title: '已设为默认', icon: 'success' });
  };

  const handleEdit = (item: AddressItem) => {
    Taro.showToast({ title: '编辑地址功能开发中', icon: 'none' });
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
          setList(prev => prev.filter(a => a.id !== item.id));
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const handleAdd = () => {
    Taro.showToast({ title: '新增地址功能开发中', icon: 'none' });
  };

  return (
    <View className={styles.page}>
      {list.length > 0 ? (
        <View className={styles.list}>
          {list.map(addr => (
            <View key={addr.id} className={styles.addrItem}>
              <View className={styles.addrHeader}>
                {addr.isDefault && (
                <View className={styles.defaultTag}>默认</View>
                )}
                <View className={styles.addrTitle}>
                  {addr.building} {addr.unit} {addr.room}
                </View>
              </View>
              <View className={styles.addrDetail}>
                {addr.building} {addr.unit} {addr.room}
              </View>
              {addr.detail && (
                <View className={styles.addrRemark}>备注：{addr.detail}</View>
              )}
              <View className={styles.addrActions}>
                <View
                  className={[
                    styles.actionItem,
                    !addr.isDefault && styles.setDefault
                  ].join(' ')}
                  onClick={() => !addr.isDefault && handleSetDefault(addr.id)}
                >
                  <Text className={styles.actionIcon}>
                    {addr.isDefault ? '✓' : '☆'}
                  </Text>
                  <Text>{addr.isDefault ? '默认地址' : '设为默认'}</Text>
                </View>
                <View
                  className={[styles.actionItem, styles.editAction].join(' ')}
                  onClick={() => handleEdit(addr)}
                >
                  <Text className={styles.actionIcon}>✏️</Text>
                  <Text>编辑</Text>
                </View>
                <View
                  className={styles.actionItem}
                  onClick={() => handleDelete(addr)}
                >
                  <Text className={styles.actionIcon}>🗑️</Text>
                  <Text>删除</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyWrap}>
          <EmptyState
            emoji='📍'
            title='还没有添加地址'
            text='添加常用地址，发布求助更方便~'
          />
        </View>
      )}

      <View className={styles.bottomBar}>
        <View className={styles.addBtn} onClick={handleAdd}>
          + 新增地址
        </View>
      </View>
    </View>
  );
};

export default AddressesPage;
