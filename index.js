const crawlerDetail = require('./detail')
const excelHandle = require('./generator')
const dayjs = require('dayjs')
var Crawler = require('crawler')

let dayNum = 120
let dates = []
while (dayNum) {
  dates.push(
    dayjs()
      .subtract(dayNum--, 'days')
      .format('YYYYMMDD')
  )
}
const arr = []

const crawlerIndex = new Crawler({
  /** 每进行一个队列时，都会被调用 */
  callback: async (error, res, done) => {
    if (error) {
      console.log(error)
      return
    }
    /** 默认使用Cheerio */
    let $ = res.$
    let detailUrl = []
    const gameLi = $('#finished li').each((index, item) => {
      const href = $(item).find('.float-right .lab-data a').eq(1).attr().href
      if (href) detailUrl.push(`https:${href}`)
    })
    // 上报excel数据
    let data = {
      date: res.options.date, // 日期
      allMatchs: gameLi.length,
      nextHalfGoal: 0,
      is21NextHalfGoal: 0,
      prevHalfHit: 0,
      nextFirstScoreTime: '',
      oneScore: 0,
      twoScore: 0,
      threeScore: 0,
      is21: 0,
      oneScore21: 0,
      twoScore21: 0,
      threeScore21: 0,
      // 特定时间计算start
      t1: 0,
      is21t1: 0,
      t2: 0,
      t3: 0,
      // 特定时间计算end
      lt40gt45noScoreCount: 0, // 40分钟前没进球比赛
      lt40gt45nextHalfGoal: 0, // 40分钟前没进球比赛下半场有球
      lt40gt45Precent: 0, // 40分钟前没进球下半有球概率
      oneScorelt40gt45: 0,
      twoScorelt40gt45: 0,
      threeScorelt40gt45: 0
    }
    for (var i = 0; i < detailUrl.length; ++i) {
      var url = detailUrl[i]
      await crawlerDetail(url).then((res) => {
        if (!res) return
        data = {
          ...data,
          prevHalfHit: res.prevHalfHit
            ? (data.prevHalfHit += 1)
            : data.prevHalfHit,
          is21:
            res.halfScore === '1-2' || res.halfScore === '2-1'
              ? (data.is21 += 1)
              : data.is21,
          nextHalfGoal: res.nextHalfGoal
            ? (data.nextHalfGoal += 1)
            : data.nextHalfGoal,
          lt40gt45noScoreCount: res.lt40gt45noScoreCount
            ? (data.lt40gt45noScoreCount += 1)
            : data.lt40gt45noScoreCount,
          lt40gt45nextHalfGoal: res.lt40gt45nextHalfGoal
            ? (data.lt40gt45nextHalfGoal += 1)
            : data.lt40gt45nextHalfGoal,
          is21NextHalfGoal: res.is21NextHalfGoal
            ? (data.is21NextHalfGoal += 1)
            : data.is21NextHalfGoal,
          // 特定时间计算start
          t1: res.t1 ? (data.t1 += 1) : data.t1,
          is21t1: res.is21t1 ? (data.is21t1 += 1) : data.is21t1,
          t2: res.t2 ? (data.t2 += 1) : data.t2,
          t3: res.t3 ? (data.t3 += 1) : data.t3
          // 特定时间计算end
        }

        // 有绝杀时统计
        if (res.prevHalfHit) {
          // 进球数统计
          if (res.nextScoreCount === 0) {
          } else if (res.nextScoreCount === 1) {
            data.oneScore++
          } else if (res.nextScoreCount === 2) {
            data.twoScore++
          } else {
            data.threeScore++
          }
          // 国际比分进球数统计
          if (res.nextScoreCount21 === 0) {
          } else if (res.nextScoreCount21 === 1) {
            data.oneScore21++
          } else if (res.nextScoreCount21 === 2) {
            data.twoScore21++
          } else {
            data.threeScore21++
          }
        } else {
          // 40分钟前无进球数下半场进球统计
          if (res.nextScoreCountlt40gt45 === 0) {
          } else if (res.nextScoreCountlt40gt45 === 1) {
            data.oneScorelt40gt45++
          } else if (res.nextScoreCountlt40gt45 === 2) {
            data.twoScorelt40gt45++
          } else {
            data.threeScorelt40gt45++
          }
        }
      })
      if (i === detailUrl.length - 1) {
        data.precent = data.prevHalfHit
          ? ((data.nextHalfGoal / data.prevHalfHit) * 100).toFixed(2) + '%'
          : 0
        data.prevHalfHit = `${data.prevHalfHit}(${data.nextHalfGoal})`
        data.is21 = `${data.is21}(${data.is21NextHalfGoal})`
        data.lt40gt45Precent = data.lt40gt45noScoreCount
          ? (
              (data.lt40gt45nextHalfGoal / data.lt40gt45noScoreCount) *
              100
            ).toFixed(2) + '%'
          : 0
        data.lt40gt45noScoreCount = `${data.lt40gt45noScoreCount}(${data.lt40gt45nextHalfGoal})`
      }
    }
    arr.push(data)
    console.log(`${res.options.date} 已完成`)
    // 每处理一个队列必须要调用done()才会进行下一个队列
    done()
  }
})

;(() => {
  const queues = dates.map((date) => ({
    uri: `https://live.leisu.com/wanchang?date=${date}`,
    date: date
  }))
  crawlerIndex.queue(queues)
  crawlerIndex.on('drain', (options) => {
    excelHandle(arr)
  })
})()
