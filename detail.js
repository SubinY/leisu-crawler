var Crawler = require('crawler')

function crawlerDetail(url) {
  let result = {
    date: '',
    nextHalfGoal: '',
    nextScoreCount: '', // 下半场进球数
    nextScoreCount21: '', // 国际比分下半场进球数
    t1: '',
    t2: '',
    t3: '',

  }
  return new Promise((resolve) => {
    new Crawler().queue([
      {
        url: url,
        /** 每进行一个队列时，都会被调用 */
        callback: (error, res, done) => {
          if (error) {
            console.log(error)
            return
          }
          let $ = res.$
          let finalHit = false // 记录是否上半场40-45+分钟进球
          let goalTimes = [] // 记录每一场进球信息
          // 详情页进球数据
          const textContent = $('.newadd .b-nav-contern .event-list li').each(
            (index, item) => {
              const text = $(item).find('.vs-content p').text()
              const timeText = $(item).find('.time').text()
              const isGoal = text.indexOf('Goal!')
              if (isGoal !== -1) {
                const time = timeText.split(/[\+\']/)[0]
                if (time >= 40 && time <= 45) finalHit = true
                if (time <= 90) goalTimes.push(time)
              }
            }
          )
          if (finalHit) {
            let nextHalfGoal = goalTimes.filter((time) => time > 45).length,
              is21NextHalfGoal = 0,
              t1 = 0,
              is21t1 = 0,
              t2 = 0,
              t3 = 0
            const halfScore = $('.half-score-panel .half-score').text()
            const halfCount = +halfScore.split('-')[0] + +halfScore.split('-')[1]
            let isfirstScore = true // 首个进球

            goalTimes.map((time, index) => {
              if (time > 45) {
                // 1-2 2-1 下半场有球
                if(halfScore === '1-2' || halfScore === '2-1') {
                  is21NextHalfGoal++
                }

                // 总进球减去半场球数的第一个时间
                if (isfirstScore) {
                  isfirstScore = false
                  if (time > 45 && time < 60) {
                    t1 = 1
                    // 1-2 2-1 下半场特一
                    ;(halfScore === '1-2' || halfScore === '2-1') && is21t1++
                  }
                  if (time >= 60 && time < 75) {
                    t2 = 1
                  }
                  if (time >= 75 && time <= 90) {
                    t3 = 1
                  }
                }
              }
            })
            result = {
              ...result,
              halfScore: halfScore,
              is21NextHalfGoal: is21NextHalfGoal,
              nextHalfGoal: nextHalfGoal,
              nextScoreCount: goalTimes.length - halfCount,
              t1: t1,
              is21t1: is21t1,
              nextScoreCount21: (halfScore === '1-2' || halfScore === '2-1') ? goalTimes.length - halfCount : 0,
              t2: t2,
              t3: t3
            }
            return resolve(result)
          }
          return resolve()
        }
      }
    ])
  })
}

module.exports = crawlerDetail
