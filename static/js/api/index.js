import { doPostRequest } from '../utils/api.js'

const getPractitioners = async (apiKey) => {
    try {
        const response = await fetch("/practitioners/", {
            method: "GET",
            headers: {
                "Authorization": `${apiKey}`
            }
        })
        const data = await response.json()
        return data
    } catch (error) {
        console.log(error)
    }
}

const getStudents = async (apiKey) => {
    try {
        const response = await fetch("/students/", {
            method: "GET",
            headers: {
                "Authorization": `${apiKey}`
            }
        })
        const data = await response.json()
        return data
    } catch (error) {
        console.log(error)
    }
}

const isAttendanceComplete = async (csrftoken, dni, log_date) => {
    try {
        const result = await doPostRequest("attendance/complete/", { dni, log_date }, csrftoken)
        return result
    } catch (error) {
        console.log(error)
    }
}

const isOnlySetEntryTime = async (csrftoken, dni, log_date) => {
    try {
        const result = await doPostRequest("attendance/only_set_entry_time/", { dni, log_date }, csrftoken)

        if (result.exists) {
            return result
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
    }
}

async function createAttendance(csrftoken, dni, log_date, entry_time) {
    try {
        const result = await doPostRequest("attendance/create/", { log_date, entry_time, dni }, csrftoken)
        return result
    } catch (error) {
        console.log(error)
    }
}

async function setExitTime(csrftoken, dni, log_date, exit_time) {
    try {
        const result = await doPostRequest("attendance/set_exit_time/", { dni, log_date, exit_time }, csrftoken)
        return result
    } catch (error) {
        console.log(error)
    }
}

export { getStudents, getPractitioners, isAttendanceComplete, isOnlySetEntryTime, createAttendance, setExitTime }