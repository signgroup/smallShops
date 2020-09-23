//index.js
//获取应用实例
const app = getApp()
const db = wx.cloud.database()
import util from './../../utils/index'
let skip = 0

Page({
     data: {
          navData: [{
                    text: '最新赞赏'
               },
               {
                    text: '排行榜'
               },
          ],
          currentTab: 0,
          navScrollLeft: 0,
          sponsorData: [],
          rankData: [],
          hiddenLoading: false, //loading是否隐藏
          limit: 20, //每页显示的条数
          num: 20,
          count: 0, //总条数
          isLoad: true, //加载状态
          triggered: false, //自定义下拉状态
     },
     //事件处理函数
     onLoad(params) {
          this.getSponsor()
          this.getRankingData()

     },
     switchNav(event) {
          var cur = event.currentTarget.dataset.current;
          //每个tab选项宽度占1/5
          var singleNavWidth = this.data.windowWidth / 2;
          //tab选项居中                            
          this.setData({
               navScrollLeft: (cur - 2) * singleNavWidth
          })
          if (this.data.currentTab == cur) {
               return false;
          } else {
               this.setData({
                    currentTab: cur
               })
          }
     },
     //切换容器
     switchTab(e) {
          const cur = e.detail.current;
          const singleNavWidth = this.data.windowWidth / 2;
          this.setData({
               currentTab: cur,
               navScrollLeft: (cur - 2) * singleNavWidth
          });

     },
     //获取赞赏数据
     getSponsor: async function () {
          wx.showNavigationBarLoading()
          let {
               num,
               limit,
               sponsorData
          } = this.data
          let _this = this
          // console.log('skip', skip)
          await db.collection('sponsor')
               .skip(skip)
               .limit(limit)
               .orderBy('timeStamp', 'desc')
               .get().then(res => {
                    // console.log(res.data)
                    let {
                         data
                    } = res
                    const list = data.map(item => {
                         item.datatime = util.formatTime(item.timeStamp)
                         item.color = util.formatColor(item.money)
                         return item
                    })
                    //还有数据，继续
                    if (data.length == num) {
                         skip = skip + num
                         this.setData({
                              isLoad: false,
                         })
                    } else {
                         //无数据了
                         this.setData({
                              isLoad: true,
                         })
                    }
                    //这样写免去for循环push
                    if (sponsorData.length) {
                         sponsorData = sponsorData.concat(list)
                    } else {
                         sponsorData = list
                    }
                    console.log(sponsorData)
                    wx.hideNavigationBarLoading()
                    _this.setData({
                         sponsorData,
                         triggered: false,
                         hiddenLoading: true
                    })

               })
               .catch(err => {
                    wx.hideNavigationBarLoading()
                    _this.setData({
                         triggered: false,
                         hiddenLoading: true
                    })
               })
     },
     //获取排行榜数据
     getRankingData() {
          wx.showNavigationBarLoading()

          const $ = db.command.aggregate
          db
               .collection('sponsor')
               .aggregate()
               .group({
                    _id: '$openid',
                    userInfo: $.first('$userInfo'),
                    max_money: $.last('$money'),
                    avg_money: $.avg('$money'),
                    sum_money: $.sum('$money')
               })
               .sort({
                    sum_money: -1
               })
               .end()
               .then(res => {
                    console.log(res)
                    wx.hideNavigationBarLoading()
                    this.setData({
                         triggered: false,
                         rankData: res.list
                    })
               })
     },
     goTop: function (e) { // 一键回到顶部
          this.setData({
               topNum: 0
          });
     },
     //滚动时触发
     scrolltoupper(e) {
          // console.log(e)

          /*
          //此方法不推荐用，1秒内执行20次setData
          this.setData({
               topStatus: e.detail.scrollTop > 400
          });
          */
          if (e.detail.scrollTop > 400) {
               this.setData({
                    topStatus: true
               });
          } else {
               this.setData({
                    topStatus: false
               });
          }
     },
     //自定义下拉刷新
     onAllRefresh() {
          if (this.data.currentTab === 0) {
               skip = 0
               this.setData({
                    sponsorData: [],
                    isLoad: true
               });
               this.getSponsor();
          } else if (this.data.currentTab === 1) {
               this.getRankingData()
          }

     },
     //自定义上拉加载
     allLoadMore(e) {
          if (!this.data.isLoad) {
               this.getSponsor();
          }
     },

})