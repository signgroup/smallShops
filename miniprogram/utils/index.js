const formatTime = (timeStamp) => {
  const d = new Date(parseInt(timeStamp) * 1000)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()
  const second = d.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


const formatColor = (price) => {
  var colorStyle = ""
  switch (price) {
       case 1:
       case 5:
            colorStyle = "dynamic-color1"
            break;
       case 10:
       case 20:
            colorStyle = "dynamic-color2"
            break;
       case 50:
       case 100:
            colorStyle = "dynamic-color3"

            break;
       default:
            colorStyle = "dynamic-color1"
            break;
  }
  return colorStyle;
}
module.exports = {
  formatTime,
  formatColor
}