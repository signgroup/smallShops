// components/top/index.js
Component({
     /**
      * 组件的属性列表
      */
     properties: {
          topStatus: {
               type: Boolean,
               value: false
          },
          
     },

     /**
      * 组件的初始数据
      */
     data: {

     },

     /**
      * 组件的方法列表
      */
     methods: {
     
	//回到顶部
     goTop: function (e) { // 一键回到顶部
          if (wx.pageScrollTo) {
               wx.pageScrollTo({
                    scrollTop: 0
               })
          } else {
               wx.showModal({
                    title: '提示',
                    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
               })
          }
     },

     }
})
