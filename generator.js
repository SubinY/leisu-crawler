const excelPort = require('excel-export')
const fs = require('fs')
const path = require('path')
const { exec } = require('shelljs')
const columns = [
  // is3up: '是否3球以上且非平局',
  {
    field: 'date',
    name: '日期',
    type: 'string'
  },
  {
    field: 'allMatchs',
    name: '当天比赛数量',
    type: 'string'
  },
  {
    field: 'prevHalfHit',
    name: '绝杀场次(下半有球)',
    type: 'string'
  },
  {
    field: 'precent',
    name: '有球概率(%)',
    type: 'string'
  },
  {
    field: 't1',
    name: '首个进球是特一',
    type: 'string'
  },
  {
    field: 't2',
    name: '首个进球是特二',
    type: 'string'
  },
  {
    field: 't3',
    name: '首个进球是特三',
    type: 'string'
  },
  {
    field: 'oneScore',
    name: '1球场次',
    type: 'string'
  },
  {
    field: 'twoScore',
    name: '2球场次',
    type: 'string'
  },
  {
    field: 'threeScore',
    name: '3球或以上场次',
    type: 'string'
  },
  {
    field: 'is21',
    name: '是否2-1或者1-2(下半有球)',
    type: 'string'
  },
  {
    field: 'oneScore21',
    name: '1球场次',
    type: 'string'
  },
  {
    field: 'twoScore21',
    name: '2球场次',
    type: 'string'
  },
  {
    field: 'threeScore21',
    name: '3球或以上场次',
    type: 'string'
  },
  {
    field: 'lt40gt45noScoreCount',
    name: '40分钟前没进球比赛(下半场有球)',
    type: 'string',
    width: 40
  },
  {
    field: 'lt40gt45Precent',
    name: '40分钟前没进球下半有球概率',
    type: 'string',
    width: 40
  },
  {
    field: 'oneScorelt40gt45',
    name: '1球场次',
    type: 'string'
  },
  {
    field: 'twoScorelt40gt45',
    name: '2球场次',
    type: 'string'
  },
  {
    field: 'threeScorelt40gt45',
    name: '3球或以上场次',
    type: 'string'
  }
  // {
  //   field: is3up,
  //   name: '是否3球以上且非平局',
  //   type: 'string'
  // }
]

function excelHandle(datas) {
  const excelConf = {
    rows: [],
    cols: []
  }

  // 表头
  for (let i = 0; i < columns.length; ++i) {
    const column = columns[i]
    excelConf.cols.push({
      caption: column['name'],
      type: column['type'], // 数据类型
      width: column['width'] || 25
    })
  }
  // 内容
  datas.forEach((item) => {
    // 解构
    for (let key in item) {
      item[key] = item[key].toString()
    }
    const {
      date,
      allMatchs,
      prevHalfHit,
      precent,
      t1,
      t2,
      t3,
      is21,
      oneScore,
      twoScore,
      threeScore,
      oneScore21,
      twoScore21,
      threeScore21,
      lt40gt45noScoreCount,
      lt40gt45Precent,
      oneScorelt40gt45,
      twoScorelt40gt45,
      threeScorelt40gt45
    } = item
    excelConf.rows.push([
      date,
      allMatchs,
      prevHalfHit,
      precent,
      t1,
      t2,
      t3,
      oneScore,
      twoScore,
      threeScore,
      is21,
      oneScore21,
      twoScore21,
      threeScore21,
      lt40gt45noScoreCount,
      lt40gt45Precent,
      oneScorelt40gt45,
      twoScorelt40gt45,
      threeScorelt40gt45
    ])
  })
  // 调用excelPort的方法，生成最终的数据
  const result = excelPort.execute(excelConf)

  const _filePath = path.resolve(__dirname, 'goods.xlsx')
  const _jsonPath = path.resolve(__dirname, 'goods.json')
  const jsonData = JSON.stringify({ data: datas })

  fs.exists(_filePath, function (exists) {
    if (exists) {
      exec(`rimraf ${_filePath} ${_jsonPath}`)
      fs.writeFile(_filePath, result, 'binary', (err) => {
        if (!err) {
          console.log('excel生成成功！')
        }
      })
      fs.writeFile(_jsonPath, jsonData, 'utf8', (err) => {
        if (!err) {
          console.log('json文件生成成功！')
        }
      })
    } else {
      fs.writeFile(_filePath, result, 'binary', (err) => {
        if (!err) {
          console.log('excel生成成功！')
        }
      })
      fs.writeFile(_jsonPath, jsonData, 'utf8', (err) => {
        if (!err) {
          console.log('json文件生成成功！')
        }
      })
    }
  })
}

module.exports = excelHandle
