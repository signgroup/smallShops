// pages/mine/index.js
const db = wx.cloud.database()

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: 'https://preview.cloud.189.cn/image/imageAction?param=730EA27C97E83C7ACDB7575A38AA9C6FA3CECAC1437A8DF9FB006BF60320B765E1BFCE5A0EDBBC8E0356A21FCC271DF97020FF184B2F6348891DADBCC1E1068BAFF564A0797BD5865CB4EB8DD31253D5E987BCFF2020275725661CFA', //默认头像
    hiddenLoading: false, //loading是否隐藏
    userInfo: {}, //用户信息
    logged: false, //授权记录
    statusBarHeight: app.globalData.systemInfo.statusBarHeight, //获取导航栏高度，x适配
    users: [], //用户列表
    refreshLoading: false, //按钮刷新状态
    refreshDisabled: false, //按钮点击状态
    countdown: '', //倒计时时间
    refreshStatus: false, //true可刷新，false不可刷新
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('statusBarHeight', this.data.statusBarHeight)
    console.log('onLoad', options)
    console.log('userInfo', app.globalData.userInfo)
    // 获取用户信息
    if (app.globalData.userInfo == undefined) {
      wx.getSetting({
        success: res => {
          console.log('onLoad-getSetting', res)
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                console.log(res)
                this.setData({
                  avatarUrl: res.userInfo.avatarUrl,
                  logged: true,
                  userInfo: res.userInfo
                })
                this.addEditUsers(res.userInfo)
                app.globalData.userInfo = res.userInfo
              }
            })
          }
        }
      })
    } else {
      this.setData({
        logged: true,
        userInfo: app.globalData.userInfo
      })
      this.addEditUsers(app.globalData.userInfo)
    }
    // this.onGetOpenid()
    console.log(app.globalData)
    this.getReleaseId()

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.clearTimer()
  },
  // 用户授权登录
  onGetUserInfo: function (e) {
    console.log(e)
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      console.log("this.data.openId", this.data.openId)
      console.log("e.detail.userInfo", e.detail.userInfo)

      this.addEditUsers(e.detail.userInfo)
      // this.getPersonalInfo(this.data.openId)
      app.globalData.userInfo = e.detail.userInfo
    }
  },
  // 添加或修改用户信息
  addEditUsers(data) {
    console.log('data', data)
    wx.setStorage({
      key: "userInfo",
      data: data
    })
    wx.cloud.callFunction({
        name: 'login',
        data: {
          params: data
        },
      })
      .then(res => {
        //console.log(res.result.openid)
        this.setData({
          openid: res.result.openid
        })
        wx.setStorageSync('openId', res.result.openid);
        app.globalData.openId = res.result.openid
      })
      .catch(err => {
        console.log(err)
      })
  },
  // 退出登录
  loginOut() {
    var _this = this
    if (_this.data.logged) {
      wx.showModal({
        title: '提示',
        content: '退出登录',
        success: function (res) {
          if (res.confirm) {
            app.globalData.userInfo = {}
            wx.removeStorageSync('userInfo')
            wx.removeStorageSync('openId')
            _this.setData({
              userInfo: {},
              openid: '',
              avatarUrl: 'https://preview.cloud.189.cn/image/imageAction?param=730EA27C97E83C7ACDB7575A38AA9C6FA3CECAC1437A8DF9FB006BF60320B765E1BFCE5A0EDBBC8E0356A21FCC271DF97020FF184B2F6348891DADBCC1E1068BAFF564A0797BD5865CB4EB8DD31253D5E987BCFF2020275725661CFA', //默认头像
              logged: false
            })
          }
        }
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请登录',
      })
    }
  },
  //获取发布内容
  getReleaseId() {

    //返回倒计时计算
    const countDown = (second) => {
      const s = second % 60;
      const m = Math.floor(second / 60);
      return `${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}`;
    };

    wx.cloud.callFunction({
        name: 'getReleaseId'
      })
      .then(res => {
        let {
          result
        } = res
        console.log('result', result)

        if (Object.keys(result).length) {
          //计算倒计时
          console.log(result.next_refresh)
          if (result.next_refresh > 0) {
            let timer = setInterval(() => {
              const countdown = countDown(result.next_refresh--)
              // console.log(countdown);
              if (result.next_refresh < 0) {
                console.log('count-down end');
                this.setData({
                  refreshStatus: true
                })
                this.clearTimer();
              } else {
                this.setData({
                  countdown,
                  timer
                })
              }
            }, 1000);
          } else {
            //可刷新
            this.setData({
              refreshStatus: true
            })
          }
        } else {
          //未发布过
          this.setData({
            refreshDisabled: true
          })
        }
        this.setData({
          hiddenLoading: true,
        })
      })
      .catch(() => {
        this.setData({
          hiddenLoading: true
        })
      })
  },
  //清空倒计时
  clearTimer() {
    clearInterval(this.data.timer)
  },
  //按钮刷新
  handelRefresh() {
    this.setData({
      refreshLoading: true,
      refreshDisabled: true
    })
    wx.cloud.callFunction({
        name: 'releaseRefresh'
      })
      .then(res => {
        console.log('res', res)
        this.getReleaseId()
        wx.showToast({
          icon: "none",
          title: '刷新成功',
        })
        this.setData({
          countdown: '60:00',
          refreshStatus: false,
          refreshLoading: false,
          refreshDisabled: false
        })
      })
      .catch(() => {
        this.setData({
          refreshLoading: false,
          refreshDisabled: false
        })
      })
  },
  //检查是否为黑名单用户
  getBlacklist() {
    wx.cloud.callFunction({
        name: 'getLlacklistId',
      })
      .then(res => {
        console.log('getLlacklistId', res)
        if (res.result) {
          wx.showToast({
            icon: 'none',
            title: '黑名单用户不能发布',
          })
        } else {
          wx.navigateTo({
            url: "./../../pageMine/release/index"
          })
        }
      })
  },
  //加入群
  joinGroup() {
    wx.previewImage({
      urls: ['http://13s.top/other/shop/qrcode.jpg'],
      current: 'http://13s.top/other/shop/qrcode.jpg' // 当前显示图片的http链接      
    })
  },
  //点击菜单栏
  handelMenu(e) {
    let {
      name
    } = e.currentTarget.dataset
    if (!this.data.logged) {
      wx.showToast({
        icon: "none",
        title: '请登录后查看'
      })
      return
    }
    if (name === "visitor") {
      this.getBlacklist()
    } else if (name === 'appreciation') {
      wx.navigateTo({
        url: "./../../pageSponsor/index/index"
      })
    } else if (name === 'manage') {
      wx.navigateTo({
        url: "./../../pageManage/release/index"
      })
    }
  }
})