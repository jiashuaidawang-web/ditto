export interface School {
  id: string
  name: string
  shortName: string
}

/** 房山大学城 / 良乡高教园区. Cross-school matching stays off. */
export const FANGSHAN_SCHOOLS: School[] = [
  { id: 'cnu_liangxiang', name: '首都师范大学（良乡校区）', shortName: '首师大良乡' },
  { id: 'bucm', name: '北京中医药大学', shortName: '北中医' },
  { id: 'btbu', name: '北京工商大学（良乡校区）', shortName: '北工商' },
  { id: 'bit_liangxiang', name: '北京理工大学（良乡校区）', shortName: '北理工良乡' },
  { id: 'ucass', name: '中国社会科学院大学', shortName: '社科大' },
]

export function findSchool(id: string): School | undefined {
  return FANGSHAN_SCHOOLS.find((school) => school.id === id)
}
