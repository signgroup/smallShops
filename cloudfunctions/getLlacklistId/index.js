// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {


     const wxContext = cloud.getWXContext()
     const result = await db.collection('blacklist').where({
          openId: wxContext.OPENID
     }).get()
     let status = ""
     if (result.data.length > 0) {
          status=true
     }
     else {
          status=false
     }
     return status



}