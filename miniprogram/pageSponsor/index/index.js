const app = getApp();
const db = wx.cloud.database()
Page({
  data: {
    logo: 'https://preview.cloud.189.cn/image/imageAction?param=71A546679CF46AC3BEEFF33C1B11CA43313841FA53C9B98D1CFF2AC4F8B9E6322235CC41717E252C290BBA5648CD016A1CDA56F7B877B9BECC9ABD33D2B220CD3004D587ECEB91CF3263FC15C1A90AB70CACC13582DF909695417E6B',
    title: '众商小店',
    desc: '赞赏是最好的支持',
    prices: [
      1, 5, 10, 20, 50, 100
    ],
    total: ""
  },

  /**
   * 进入页面
   */
  onLoad: function () {

    this.getSponsor()
  },

  /**
   * 分享
   */
  onShareAppMessage: function () {
    return {
      title: '赞赏全栈生姜头',
      desc: '点滴支持,是我继续坚持的动力',
      sponsorData: []
    }
  },

  /**
   * 选中赞赏金额
   */
  requestPayment(e) {
    wx.showLoading({
      title: '加载中',
    })
    let {
      money
    } = e.currentTarget.dataset
    this.setData({
      loading: true
    })

    // 此处需要先调用wx.login方法获取code，然后在服务端调用微信接口使用code换取下单用户的openId
    // 具体文档参考https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-login.html?t=20161230#wxloginobject
    let _this = this
    wx.cloud.callFunction({
      name: "pay",
      data: {
        money
      },
      success(res) {
        /* {
          appId: "wx810481485d1c215c"
          nonceStr: "fHGfhjHqcYdPGB4C"
          package: "prepay_id=wx11094647388252f4fe57d8588878260000"
          paySign: "D601B33F79D5F85EC45180A9C7B92A8D"
          signType: "MD5"
          timeStamp: "1599788807"
          timestamp: "1599788807"
        } */
        console.log("提交成功", res.result)
        _this.pay(res.result, money)
      },
      fail(res) {
        console.log("提交失败", res)
      }
    })
  },
  //实现小程序支付
  pay(payData, money) {
    console.log('谁进了')
    //官方标准的支付方法
    let _this = this
    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package, //统一下单接口返回的 prepay_id 格式如：prepay_id=***
      signType: 'MD5',
      paySign: payData.paySign, //签名
      success(res) {
        //{errMsg: "requestPayment:ok"}
        console.log("支付成功", res)
        wx.showToast({
          icon: 'none',
          title: '您的赞赏是最大的鼓励和支持!'
        })
        _this.addSponsor(payData.timeStamp, money)
      },
      fail(res) {
        // {errMsg: "requestPayment:fail cancel"}
        console.log("支付失败", res)
      },
      complete(res) {
        // {errMsg: "requestPayment:ok"}
        // {errMsg: "requestPayment:fail cancel"}
        console.log("支付完成", res)
      }
    })
  },
  //添加赞助记录
  addSponsor(timeStamp, money) {
    console.log('谁进了')
    let params = {
      timeStamp,
      money,
      userInfo: wx.getStorageSync('userInfo')
    }
    wx.cloud.callFunction({
        name: "addSponsor",
        data: {
          params
        }
      })
      .then(res => {
        console.log('添加成功', res)
        this.getSponsor()
      })
  },

  //监听数据导航
  getSponsor: async function () {
    wx.showNavigationBarLoading()
    const _ = db.command
    await db.collection('sponsor').where({
      money: _.exists(true)
    }).count().then(res => {
      console.log(res.total)
      let {
        total
      } = res
      this.setData({
        total
      })
    })
    await db.collection('sponsor').orderBy('timeStamp', 'desc')
      .limit(8)
      .get()
      .then(res => {
        console.log(res)
        this.setData({
          sponsorData: res.data,
          hiddenLoading: true
        })
        wx.hideNavigationBarLoading()
      })
      .catch(console.error)
  },
})