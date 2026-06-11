import React, { useState, useMemo } from 'react';
import { View, Text, Input, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import HelperCard from '@/components/HelperCard';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import type { HelperRequest } from '@/types';
import styles from './index.module.scss';

const hotKeywords = ['快递', '看孩子', '搬家', '借工具', '买药', '遛狗', '打酱油', '扛东西'];

const SearchPage: React.FC = () => {
  const helpers = useAppStore((s) => s.helpers);
  const [keyword, setKeyword] = useState('');
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState<string[]>(['借梯子', '取快递']);

  useDidShow(() => {
    console.log('[Search] page show, helpers:', helpers.length);
  });

  const results = useMemo(() => {
    if (!keyword.trim()) return [];
    const kw = keyword.trim().toLowerCase();
    return helpers.filter(h =>
      h.title.toLowerCase().includes(kw) ||
      h.description.toLowerCase().includes(kw) ||
      h.building.includes(kw) ||
      h.type.toLowerCase().includes(kw)
    );
  }, [keyword, helpers]);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    setSearched(true);
    const kw = keyword.trim();
    if (!history.includes(kw)) {
      setHistory([kw, ...history].slice(0, 10));
    }
  };

  const handleTagClick = (tag: string) => {
    setKeyword(tag);
    setSearched(true);
    if (!history.includes(tag)) {
      setHistory([tag, ...history].slice(0, 10));
    }
  };

  const handleRemoveHistory = (tag: string, e: any) => {
    e.stopPropagation();
    setHistory(history.filter(h => h !== tag));
  };

  const handleClearHistory = () => {
    Taro.showModal({
      title: '提示',
      content: '确定清空搜索历史？',
      success: (res) => {
        if (res.confirm) {
          setHistory([]);
          Taro.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.searchBar}>
        <View className={styles.searchInputWrap}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.input}
            placeholder='搜索求助内容、楼栋号...'
            value={keyword}
            onInput={e => setKeyword(e.detail.value)}
            confirmType='search'
            onConfirm={handleSearch}
            focus
            autoFocus
          />
        </View>
        <Button className={styles.cancelBtn} onClick={handleCancel}>取消</Button>
      </View>

      <ScrollView className={styles.content} scrollY enhanced showScrollbar={false}>
        {!searched && !keyword ? (
          <View>
            <View className={styles.hotSearches}>
              <View className={styles.sectionTitle}>🔥 热门搜索</View>
              <View className={styles.hotTags}>
                {hotKeywords.map(tag => (
                  <View
                    key={tag}
                    className={styles.hotTag}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </View>
                ))}
              </View>
            </View>

            {history.length > 0 && (
              <View className={styles.hotSearches}>
                <View className={styles.historyHeader}>
                  <View className={styles.sectionTitle}>🕐 搜索历史</View>
                  <Text className={styles.clearBtn} onClick={handleClearHistory}>清空</Text>
                </View>
                <View className={styles.historyTags}>
                  {history.map(tag => (
                    <View
                      key={tag}
                      className={styles.historyTag}
                      onClick={() => handleTagClick(tag)}
                    >
                      <Text>{tag}</Text>
                      <Text
                        className={styles.closeIcon}
                        onClick={(e) => handleRemoveHistory(tag, e)}
                      >
                        ✕
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View>
            <View className={styles.sectionTitle} style={{ marginBottom: 16 }}>
              {searched ? `搜索结果 (${results.length})` : '输入关键词搜索'}
            </View>
            {results.length > 0 ? (
              results.map((h: HelperRequest) => <HelperCard key={h.id} data={h} />)
            ) : searched ? (
              <EmptyState
                emoji='🔍'
                title='没有找到相关内容'
                text='换个关键词试试吧'
              />
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchPage;
