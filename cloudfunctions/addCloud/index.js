// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var sql = db.collection(event.db)
  var res;
  //对象key动态赋值
  var params=event.params
  if (params) {
     
     let data={
       ...params
     }
    if (event.date){
      data.date = new Date()
     }
    else if (data.date){
      // 与标准时间相差8个小时（快了8小时） 推荐使用 .toGMTString()
      let d = new Date(data.date);
      let curDate = new Date(d.setHours(d.getHours() - 8))
      data.date = curDate

     }else{
      data.startTime = new Date()
      data.currentTime = new Date()
     }
    res = await sql
      .add({
        data: data
      })
  }
  return {
    res,
    event,
    params,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

// wx.cloud.callFunction({
// name: 'incCloud',
//   data: {
//   db: "user",
//     params: {
//           ...params
//   }
// }
//     })
//     .then(res => {
//   console.log(res)
// })
//   .catch(err => {
//     console.log(err)
//   })