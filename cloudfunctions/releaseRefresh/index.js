// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext()
     let data = {
          refresh_date: new Date().getTime(),
     }

     try {
          return await db.collection('shops').where({
                    openId: wxContext.OPENID,
               })
               .update({
                    data: data
               })
     } catch (e) {
          console.error(e)
     }
}