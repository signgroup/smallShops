// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext()

     let {
          data
     } = await db.collection('shops').where({
          openId: wxContext.OPENID
     }).get()
     let result={}
     if (data.length) {
          //获取数组第一个对象
          let [obj] = data
          //增加一小时新时间
          let newDate = obj.refresh_date + 60*60 * 1000;
          console.log('refresh_date', obj.refresh_date)
          //获取一小时后的秒数
          let next_refresh = Math.floor((newDate - new Date().getTime()) / 1000)
          console.log('下次刷新', next_refresh)
          console.log('newDate', newDate)
          obj.next_refresh = next_refresh > 0 ? next_refresh : 0
          result= obj
     }
     return result
}