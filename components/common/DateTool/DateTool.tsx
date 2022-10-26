import moment = require("moment");

export  function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export  function subtractDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}

export function getTimeByMinutes(minutes){
    return moment.utc().startOf('day').add(minutes, 'minutes').format('hh:mm A');
}
