export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/publish/index',
    'pages/community/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/search/index',
    'pages/my-requests/index',
    'pages/my-responses/index',
    'pages/credit/index',
    'pages/blacklist/index',
    'pages/addresses/index',
    'pages/thanks-detail/index',
    'pages/notice-detail/index',
    'pages/report/index',
    'pages/admin/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF7A45',
    navigationBarTitleText: '邻里互助',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF9F5'
  },
  tabBar: {
    color: '#9C8A8A',
    selectedColor: '#FF7A45',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '广场'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/community/index',
        text: '社区'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
