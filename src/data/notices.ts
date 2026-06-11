import type { NoticeItem, ThanksItem, AddressItem, BlacklistItem, CreditRecord } from '@/types';
import { mockUsers } from './helpers';

export const mockNotices: NoticeItem[] = [
  {
    id: 'n001',
    title: '【重要】本周末小区将进行消防演练',
    content: '各位邻居大家好！为提高小区消防安全意识，物业定于本周六（6月14日）上午9:00-11:00在小区中心广场进行消防演练。届时会有消防警报声，请大家不要惊慌，积极配合。演练期间3栋、5栋电梯将临时停运，请提前做好安排。感谢大家的理解与支持！',
    type: 'warning',
    publisher: '物业管理处',
    isTop: true,
    createdAt: '2026-06-10T02:00:00.000Z'
  },
  {
    id: 'n002',
    title: '邻里互助志愿者招募啦！',
    content: '亲爱的邻居们！为了让我们的社区更加温暖和谐，现面向全体住户招募"邻里互助志愿者"。志愿者职责包括：\n1. 帮助行动不便的老人采购生活物资\n2. 协助组织社区活动\n3. 紧急情况时的临时支援\n\n有意向的邻居请在本帖下方留言或直接联系物业报名。让我们一起建设美好家园！',
    type: 'activity',
    publisher: '社区居委会',
    isTop: true,
    createdAt: '2026-06-08T06:00:00.000Z'
  },
  {
    id: 'n003',
    title: '关于小区垃圾分类新规的通知',
    content: '自6月15日起，小区将严格执行新的垃圾分类标准：\n• 可回收物：每周二、五投放\n• 厨余垃圾：每日 7:00-9:00，18:00-20:00\n• 其他垃圾：每日投放\n• 有害垃圾：每月第一个周日集中回收\n\n请各位邻居相互转告，共同维护小区环境。',
    type: 'system',
    publisher: '物业管理处',
    isTop: false,
    createdAt: '2026-06-05T08:00:00.000Z'
  },
  {
    id: 'n004',
    title: '夏季用电安全温馨提示',
    content: '随着气温升高，空调等大功率电器使用增多，请各位邻居注意用电安全：\n1. 避免多个大功率电器同时使用一个插座\n2. 外出时请拔掉不必要的电源插头\n3. 发现电线老化、插座松动请及时报修\n4. 空调温度建议设置在26°C以上，节能环保\n\n如有任何电力问题，请拨打物业24小时热线：400-xxx-xxxx',
    type: 'warning',
    publisher: '物业管理处',
    isTop: false,
    createdAt: '2026-06-01T02:00:00.000Z'
  },
  {
    id: 'n005',
    title: '社区亲子活动报名通知',
    content: '为增进邻里感情，社区将于6月22日（周日）下午14:00-17:00在中心广场举办"大手拉小手"亲子趣味运动会。活动内容包括：两人三足、家庭接力赛、趣味套圈等，参与即有精美礼品！\n\n报名对象：3-12岁小朋友家庭\n报名方式：小程序内点击【社区活动】-【亲子运动会】在线报名\n名额有限，先到先得！',
    type: 'activity',
    publisher: '社区居委会',
    isTop: false,
    createdAt: '2026-06-03T06:00:00.000Z'
  }
];

export const mockThanks: ThanksItem[] = [
  {
    id: 't001',
    fromUserId: 'u001',
    fromUserName: '王阿姨',
    fromUserAvatar: 'https://picsum.photos/id/64/200/200',
    toUserId: 'u002',
    toUserName: '李先生',
    toUserAvatar: 'https://picsum.photos/id/91/200/200',
    helperRequestId: 'h004',
    helperTitle: '借一把电动螺丝刀',
    content: '真的太感谢李先生了！我一个老人家装柜子正发愁找不到工具，李先生二话不说就把螺丝刀送过来了，还帮我看了下说明书。邻里之间能这样互帮互助，住在这里真的很暖心！',
    createdAt: '2026-06-10T14:00:00.000Z',
    likes: 28,
    comments: 6
  },
  {
    id: 't002',
    fromUserId: 'u002',
    fromUserName: '李先生',
    fromUserAvatar: 'https://picsum.photos/id/91/200/200',
    toUserId: 'u003',
    toUserName: '张女士',
    toUserAvatar: 'https://picsum.photos/id/177/200/200',
    helperRequestId: 'h002',
    helperTitle: '下午临时有事，求帮忙照看孩子1小时',
    content: '真心感谢张女士！临时开会走不开，孩子没人照看，张女士主动请缨帮忙照看了一个多小时，还辅导孩子做完了作业。有这样的好邻居真是我们全家的福气！下次张女士有任何需要帮忙的地方尽管开口！',
    createdAt: '2026-06-12T09:30:00.000Z',
    likes: 45,
    comments: 12
  },
  {
    id: 't003',
    fromUserId: 'u005',
    fromUserName: '小刘',
    fromUserAvatar: 'https://picsum.photos/id/1027/200/200',
    toUserId: 'u003',
    toUserName: '张女士',
    toUserAvatar: 'https://picsum.photos/id/177/200/200',
    helperRequestId: 'h005',
    helperTitle: '帮忙去药店买个药',
    content: '千言万语汇成一句感谢！老母亲在家突发感冒发烧，我在公司赶不回去急得团团转，是张女士看到我的求助后二话不说就去药店买了药送过去。老人家说张女士还陪她坐了半小时确认没事才走。远亲不如近邻，这句话今天我算是真正体会到了！',
    createdAt: '2026-06-12T13:00:00.000Z',
    likes: 86,
    comments: 23
  },
  {
    id: 't004',
    fromUserId: 'u004',
    fromUserName: '陈大爷',
    fromUserAvatar: 'https://picsum.photos/id/338/200/200',
    toUserId: 'u001',
    toUserName: '王阿姨',
    toUserAvatar: 'https://picsum.photos/id/64/200/200',
    helperRequestId: 'h004',
    helperTitle: '借一把电动螺丝刀',
    content: '感谢王阿姨上周借我梯子，还帮我扶着换了好几个灯泡。我们老两口腿脚不方便，子女又不在身边，有事情第一个想到的就是小区的好邻居们。谢谢所有帮助过我们的人，也希望我们的小区越来越温暖！',
    createdAt: '2026-06-09T16:00:00.000Z',
    likes: 52,
    comments: 18
  },
  {
    id: 't005',
    fromUserId: 'u003',
    fromUserName: '张女士',
    fromUserAvatar: 'https://picsum.photos/id/177/200/200',
    toUserId: 'u004',
    toUserName: '陈大爷',
    toUserAvatar: 'https://picsum.photos/id/338/200/200',
    helperRequestId: 'h007',
    helperTitle: '需要人帮忙遛狗',
    content: '陈大爷知道我出差后，主动提出帮忙每天遛狗，还拍了好多狗狗的照片发给我报平安。出差回来后看到狗狗养得精神抖擞，真心感动。陈大爷年纪这么大还愿意帮邻居做这些事，是我们年轻人学习的榜样！',
    createdAt: '2026-06-11T10:00:00.000Z',
    likes: 34,
    comments: 9
  }
];

export const mockAddresses: AddressItem[] = [
  {
    id: 'a001',
    building: '3栋',
    unit: '2单元',
    room: '1502',
    detail: '门口有个红色脚垫',
    isDefault: true
  },
  {
    id: 'a002',
    building: '3栋',
    unit: '2单元',
    room: 'B1层储物间',
    detail: '15号储物柜',
    isDefault: false
  }
];

export const mockBlacklist: BlacklistItem[] = [];

export const mockCreditRecords: CreditRecord[] = [
  {
    id: 'c001',
    type: 'plus',
    score: 2,
    reason: '完成互助"借一把电动螺丝刀"',
    relatedRequestId: 'h004',
    createdAt: '2026-06-10T12:00:00.000Z'
  },
  {
    id: 'c002',
    type: 'plus',
    score: 3,
    reason: '获得用户感谢墙好评',
    relatedRequestId: 'h004',
    createdAt: '2026-06-10T14:10:00.000Z'
  },
  {
    id: 'c003',
    type: 'plus',
    score: 5,
    reason: '完成紧急互助"帮忙去药店买个药"',
    relatedRequestId: 'h005',
    createdAt: '2026-06-12T11:00:00.000Z'
  },
  {
    id: 'c004',
    type: 'plus',
    score: 2,
    reason: '完成互助"下午临时有事，求帮忙照看孩子1小时"',
    relatedRequestId: 'h002',
    createdAt: '2026-06-12T08:30:00.000Z'
  },
  {
    id: 'c005',
    type: 'minus',
    score: 1,
    reason: '互助取消（已响应）',
    relatedRequestId: 'h010',
    createdAt: '2026-06-12T04:10:00.000Z'
  }
];

export const currentUser = mockUsers[0];
