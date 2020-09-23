// miniprogram/pageMine/release/index.js
Page({

     /**
      * 页面的初始数据
      */
     data: {
          textNum: 0, //文字数量
          iconCamera: "https://preview.cloud.189.cn/image/imageAction?param=EE4233288D15AF1089C3F6A5FA2C285C6D3B9C0A98167643F0234C88E4BDAE834953033C308EFBB5103F12F4E7A77B9E2F915D8DC8E77DF4CBF801D47063AA9292BABC576320B083F878A836E7CFE22C99B48ECF6DD7250ABD7E6BC5",
          hiddenLoading: false, //loading状态
          filePath: "", //临时路径
          cloudPath: "", //图片名称
          btnLoading: false, //按钮loading
          addLoading: false, //添加修改loading
          deleteLoading: true, //删除loading
          _id: '', //接收id
          form: {
               title: '',
               appId: ''
          },
          modal: false,

     },

     /**
      * 生命周期函数--监听页面加载
      */
     onLoad: function (options) {

          this.getReleaseId()

     },

     /**
      * 生命周期函数--监听页面初次渲染完成
      */
     onReady: function () {

     },

     /**
      * 生命周期函数--监听页面显示
      */
     onShow: function () {

     },

     /**
      * 生命周期函数--监听页面隐藏
      */
     onHide: function () {

     },

     /**
      * 生命周期函数--监听页面卸载
      */
     onUnload: function () {

     },

     /**
      * 页面相关事件处理函数--监听用户下拉动作
      */
     onPullDownRefresh: function () {

     },

     /**
      * 页面上拉触底事件的处理函数
      */
     onReachBottom: function () {

     },

     /**
      * 用户点击右上角分享
      */
     onShareAppMessage: function () {

     },
     //获取发布内容
     getReleaseId() {
          wx.showNavigationBarLoading()
          wx.cloud.callFunction({
                    name: 'getReleaseId'
               })
               .then(res => {
                    let {
                         result
                    } = res
                    console.log('result', result)
                    if (Object.keys(result).length) {
                         let form = {
                              title: result.title,
                              appId: result.appId
                         }
                         this.setData({
                              form,
                              _id: result._id,
                              cloudPath: 'cloudPath',
                              iconCamera: result.cloud
                         })
                    }
                    this.setData({
                         hiddenLoading: true,
                    })
                    wx.hideNavigationBarLoading()
               })
               .catch(() => {
                    this.setData({
                         hiddenLoading: true
                    })
                    wx.hideNavigationBarLoading()

               })
     },

     //获取文本域内容
     bindTextArea: function (e) {
          let {
               type
          } = e.currentTarget.dataset
          this.data.form[type] = e.detail.value
          /* if (type === "introduce") {
               this.setData({
                    textNum: e.detail.value.length
               })
          } */
          this.setData({
               form: this.data.form
          })
     },

     //添加图片
     chooseImage: function (e) {
          var that = this;
          wx.chooseImage({
               count: 1,
               sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
               sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
               success: function (res) {
                    // 本地文件路径filePath
                    const [filePath] = res.tempFilePaths;
                    //生成时间戳
                    let currentTime = new Date().getTime();
                    //云存储图片名字
                    let cloudPath = currentTime + filePath.match(/\.[^.]+?$/)[0]
                    console.log('cloudPath', cloudPath)
                    console.log('filePath', filePath)
                    that.setData({
                         cloudPath: cloudPath,
                         iconCamera: filePath
                    });
               }
          })
     },
     //查询发布日志
     getRecordLog: async function () {
          await wx.cloud.callFunction({
                    name: 'getRecordLog'
               })
               .then(res => {
                    console.log('res', res)
                    return res.result.data
               })
     },

     //验证
     verification() {
          let flag = true
          if (!this.data.form.title) {
               wx.showToast({
                    icon: 'none',
                    title: '请输入小商店名称！'
               })
               flag = false

          }
          if (this.data.form.title.length < 2) {
               wx.showToast({
                    icon: 'none',
                    title: '请输入2位以上名称！'
               })
               flag = false
          }
          if (!this.data.cloudPath) {
               wx.showToast({
                    icon: 'none',
                    title: '请上传小商店二维码！'
               })
               flag = false
          }
          if (!this.data.form.appId) {
               wx.showToast({
                    icon: 'none',
                    title: '请输入小程序AppID'
               })
               flag = false
          }
          return flag
     },
     //提交-添加图片
     handleConfirm: async function () {
          const flag = this.verification()
          if (flag) {
               const recordLogData = await wx.cloud.callFunction({
                         name: 'getRecordLog'
                    })
                    .then(res => {
                         console.log('res', res)
                         return res.result.data
                    })
               console.log('recordLogData', recordLogData)
               if (recordLogData.length > 0) {
                    wx.showToast({
                         icon: 'none',
                         title: '一天最多发布一次，请明天再试！'
                    })
                    return
               }
               //添加修改按钮loading
               this.setData({
                    addLoading: true
               })
               wx.showNavigationBarLoading();
               console.log('图片url', this.data.iconCamera)
               this.handelRelease(await this.uploadFileCloud())
          }
     },

     //上传二维码
     uploadFileCloud: async function () {
          wx.showLoading({
               title: '正在上传二维码',
          })
          return await wx.cloud.uploadFile({
                    cloudPath: 'qrcode/mp/' + this.data.cloudPath,
                    filePath: this.data.iconCamera
               })
               .then(res => {
                    return res.fileID
               })
               .catch(err => {
                    onsole.error('[上传图片] 失败：', err)
                    wx.showToast({
                         icon: 'none',
                         title: '图片上传失败！'
                    })
                    wx.hideLoading()
               })
     },

     //修改信息
     updateRelease: async function () {
          const flag = this.verification()
          if (flag) {
               let params = {
                    ...this.data.form
               }
               this.setData({
                    addLoading: true
               })
               //如果重新上传图片，添加cloud
               if (this.data.iconCamera.startsWith("http://tmp/")) {
                    let fileID = await this.uploadFileCloud()
                    console.log('fileID', fileID)
                    params.cloud = fileID
               }
               wx.cloud.callFunction({
                         name: 'updateRelease',
                         data: {
                              params
                         }
                    })
                    .then(res => {
                         wx.hideLoading()
                         wx.showToast({
                              icon: 'none',
                              title: '更新成功！'
                         })
                         this.setData({
                              addLoading: false
                         })
                         console.log('updateRelease res', res.result)
                    })
          }

     },
     //发布
     handelRelease(fileID) {
          wx.showLoading({
               title: '请等待',
          })
          let params = {
               ...this.data.form,
               cloud: fileID,
               openId: wx.getStorageSync('openId'),
               userInfo: wx.getStorageSync('userInfo'),
               count: 0
          }
          console.log('params', params)

          wx.cloud.callFunction({
                    name: 'addRelease',
                    data: {
                         params: params
                    }
               })
               .then(res => {
                    console.log(res)
                    wx.hideNavigationBarLoading();
                    wx.hideLoading()
                    console.log('[数据库] [新增记录] 成功，记录 _id: ', res)
                    this.getReleaseId()
                    wx.showToast({
                         icon: 'none',
                         title: '添加成功'
                    });
                    this.setData({
                         addLoading: false
                    })
                    this.addRecordLog()
               })
               .catch(err => {
                    wx.hideToast();
                    wx.hideNavigationBarLoading();
                    wx.showToast({
                         icon: 'none',
                         title: '新增记录失败'
                    });
                    console.error('[数据库] [新增记录] 失败：', err);
               })

     },
     //添加记录
     addRecordLog() {
          wx.cloud.callFunction({
                    name: 'addRecordLog'
               })
               .then(res => {
                    console.log('addRecordLog res', res)

               })
     },
     //删除记录
     handleDelete() {
          const deleteReleaseId = () => {
               wx.cloud.callFunction({
                         name: 'deleteReleaseId'
                    })
                    .then(res => {
                         console.log('res', res)
                         if (res.result.stats.removed >= 1) {
                              this.deleteFiles([this.data.iconCamera])

                              wx.showToast({
                                   icon: 'none',
                                   title: '删除成功'
                              });

                              this.setData({
                                   form: {},
                                   _id: '',
                                   iconCamera: "https://preview.cloud.189.cn/image/imageAction?param=EE4233288D15AF1089C3F6A5FA2C285C6D3B9C0A98167643F0234C88E4BDAE834953033C308EFBB5103F12F4E7A77B9E2F915D8DC8E77DF4CBF801D47063AA9292BABC576320B083F878A836E7CFE22C99B48ECF6DD7250ABD7E6BC5",
                                   filePath: "", //临时路径
                                   cloudPath: "", //图片名称
                                   addLoading: false, //添加修改loading
                                   deleteLoading: true, //删除loading
                              })
                         } else {
                              wx.showToast({
                                   icon: 'none',
                                   title: '删除失败'
                              });
                         }
                    })
                    .catch(err => {
                         wx.showToast({
                              icon: 'none',
                              title: '删除失败'
                         });
                    })

          }

          wx.showModal({
               title: '提示',
               content: '删除后将失去展示机会，\r\n是否确定删除？',
               success(res) {
                    if (res.confirm) {
                         deleteReleaseId()
                         console.log('用户点击确定')
                    } else if (res.cancel) {
                         console.log('用户点击取消')
                    }
               }
          })


     },
     //删除文件
     deleteFiles(fileIDs) {
          console.log(fileIDs instanceof Array, fileIDs)
          wx.cloud.callFunction({
                    name: 'deleteFile',
                    data: {
                         fileIDs
                    }
               })
               .then(res => {
                    console.log(res)
               })
     },
//弹框
     handelModal(){
          this.setData({
               modal:!this.data.modal
          })
     },
})