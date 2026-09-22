// Seed data for `universities`, keyed by the exact `university` value in the CSV (PLAN.md §5).
// Add new universities here when the dataset grows; the importer warns on unmapped names.

export interface UniversitySeed {
  name_cn: string;
  province: string;
  city: string;
  website: string;
}

export const UNIVERSITY_MAP: Readonly<Record<string, UniversitySeed>> = {
  'Anhui University': {
    name_cn: '安徽大学',
    province: 'Anhui',
    city: 'Hefei',
    website: 'https://www.ahu.edu.cn',
  },
  'Beihang University': {
    name_cn: '北京航空航天大学',
    province: 'Beijing',
    city: 'Beijing',
    website: 'https://www.buaa.edu.cn',
  },
  'Beijing Jiaotong University': {
    name_cn: '北京交通大学',
    province: 'Beijing',
    city: 'Beijing',
    website: 'https://www.bjtu.edu.cn',
  },
  'Beijing University of Technology': {
    name_cn: '北京工业大学',
    province: 'Beijing',
    city: 'Beijing',
    website: 'https://www.bjut.edu.cn',
  },
  'Central China Normal University': {
    name_cn: '华中师范大学',
    province: 'Hubei',
    city: 'Wuhan',
    website: 'https://www.ccnu.edu.cn',
  },
  'Central South University': {
    name_cn: '中南大学',
    province: 'Hunan',
    city: 'Changsha',
    website: 'https://www.csu.edu.cn',
  },
  "Chang'an University": {
    name_cn: '长安大学',
    province: 'Shaanxi',
    city: "Xi'an",
    website: 'https://www.chd.edu.cn',
  },
  'China University of Geosciences (Beijing)': {
    name_cn: '中国地质大学（北京）',
    province: 'Beijing',
    city: 'Beijing',
    website: 'https://www.cugb.edu.cn',
  },
  'Chongqing University': {
    name_cn: '重庆大学',
    province: 'Chongqing',
    city: 'Chongqing',
    website: 'https://www.cqu.edu.cn',
  },
  'Dalian University of Technology': {
    name_cn: '大连理工大学',
    province: 'Liaoning',
    city: 'Dalian',
    website: 'https://www.dlut.edu.cn',
  },
  'Harbin Engineering University': {
    name_cn: '哈尔滨工程大学',
    province: 'Heilongjiang',
    city: 'Harbin',
    website: 'https://www.hrbeu.edu.cn',
  },
  'Harbin Institute of Technology': {
    name_cn: '哈尔滨工业大学',
    province: 'Heilongjiang',
    city: 'Harbin',
    website: 'https://www.hit.edu.cn',
  },
  'Hohai University': {
    name_cn: '河海大学',
    province: 'Jiangsu',
    city: 'Nanjing',
    website: 'https://www.hhu.edu.cn',
  },
  'Huazhong Agricultural University': {
    name_cn: '华中农业大学',
    province: 'Hubei',
    city: 'Wuhan',
    website: 'https://www.hzau.edu.cn',
  },
  'Jiangsu University': {
    name_cn: '江苏大学',
    province: 'Jiangsu',
    city: 'Zhenjiang',
    website: 'https://www.ujs.edu.cn',
  },
  'Jilin University': {
    name_cn: '吉林大学',
    province: 'Jilin',
    city: 'Changchun',
    website: 'https://www.jlu.edu.cn',
  },
  'Nanjing University': {
    name_cn: '南京大学',
    province: 'Jiangsu',
    city: 'Nanjing',
    website: 'https://www.nju.edu.cn',
  },
  'Nanjing University of Science and Technology': {
    name_cn: '南京理工大学',
    province: 'Jiangsu',
    city: 'Nanjing',
    website: 'https://www.njust.edu.cn',
  },
  'Northeastern University': {
    name_cn: '东北大学',
    province: 'Liaoning',
    city: 'Shenyang',
    website: 'https://www.neu.edu.cn',
  },
  'Northwestern Polytechnical University': {
    name_cn: '西北工业大学',
    province: 'Shaanxi',
    city: "Xi'an",
    website: 'https://www.nwpu.edu.cn',
  },
  'Qingdao University': {
    name_cn: '青岛大学',
    province: 'Shandong',
    city: 'Qingdao',
    website: 'https://www.qdu.edu.cn',
  },
  'Shandong University': {
    name_cn: '山东大学',
    province: 'Shandong',
    city: 'Jinan',
    website: 'https://www.sdu.edu.cn',
  },
  'Southeast University': {
    name_cn: '东南大学',
    province: 'Jiangsu',
    city: 'Nanjing',
    website: 'https://www.seu.edu.cn',
  },
  'Southwest Jiaotong University': {
    name_cn: '西南交通大学',
    province: 'Sichuan',
    city: 'Chengdu',
    website: 'https://www.swjtu.edu.cn',
  },
  'Tongji University': {
    name_cn: '同济大学',
    province: 'Shanghai',
    city: 'Shanghai',
    website: 'https://www.tongji.edu.cn',
  },
  'University of Electronic Science and Technology of China': {
    name_cn: '电子科技大学',
    province: 'Sichuan',
    city: 'Chengdu',
    website: 'https://www.uestc.edu.cn',
  },
  'Wenzhou University': {
    name_cn: '温州大学',
    province: 'Zhejiang',
    city: 'Wenzhou',
    website: 'https://www.wzu.edu.cn',
  },
  'Wuhan University': {
    name_cn: '武汉大学',
    province: 'Hubei',
    city: 'Wuhan',
    website: 'https://www.whu.edu.cn',
  },
  "Xi'an Jiaotong University": {
    name_cn: '西安交通大学',
    province: 'Shaanxi',
    city: "Xi'an",
    website: 'https://www.xjtu.edu.cn',
  },
  'Xinjiang University': {
    name_cn: '新疆大学',
    province: 'Xinjiang',
    city: 'Ürümqi',
    website: 'https://www.xju.edu.cn',
  },
  'Yangzhou University': {
    name_cn: '扬州大学',
    province: 'Jiangsu',
    city: 'Yangzhou',
    website: 'https://www.yzu.edu.cn',
  },
  'Yanshan University': {
    name_cn: '燕山大学',
    province: 'Hebei',
    city: 'Qinhuangdao',
    website: 'https://www.ysu.edu.cn',
  },
  'Zhejiang Normal University': {
    name_cn: '浙江师范大学',
    province: 'Zhejiang',
    city: 'Jinhua',
    website: 'https://www.zjnu.edu.cn',
  },
  'Zhejiang University': {
    name_cn: '浙江大学',
    province: 'Zhejiang',
    city: 'Hangzhou',
    website: 'https://www.zju.edu.cn',
  },
};
