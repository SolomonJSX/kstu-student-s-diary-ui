export const BASE_URL = 'http://10.0.2.2:5204/api';

//http://10.0.2.2:5204/api
//http://167.86.70.156:8080/api

export const LOGIN_URL = `/login`;


export const SEMESTER_SCHEDULE_URL = `/schedule/semester`;
export const REFRESH_SEMESTER_SCHEDULE_URL = `${SEMESTER_SCHEDULE_URL}/refresh`;
export const TODAY_SCHEDULE_URL = `${SEMESTER_SCHEDULE_URL}/todaySchedule`
export const REFRESH_SCHEDULE_URL = `${SEMESTER_SCHEDULE_URL}/refresh`

const UMKD = "/umkd"
export const UMKD_LISTS = `${UMKD}/lists`
export const UMKD_TEACHER_FILES = `${UMKD}/files`

export const PROFILE_URL = `/profile/fetch`

export const STUDY_TASK_URL = "/tasks/page"

export const GRADES_URL = "/grades"

export const CERTIFICATION_URL = "/certification"