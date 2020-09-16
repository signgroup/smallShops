// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  console.log(event)
  console.log(context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const {
    OPENID,
    APPID
  } = cloud.getWXContext()
  const db = cloud.database()

  // 查询有没用户数据
  const users = await db.collection('users').where({
    _openid: OPENID
  }).get()
  const sql = db.collection('users')
  var res;
  if (users.data.length) {
    res = await sql.where({
      _openid: OPENID
    }).update({
      data: {
        userInfo: event.params,
        currentTime: new Date()
      }
    })
  } else {
    res = await sql.add({
      data: {
        _openid: OPENID,
        userInfo: event.params,
        currentTime: new Date(),
        startTime: new Date()
      }
    })
  }



  return {
    event,
    users,
    openid: OPENID,
    res
  }
}