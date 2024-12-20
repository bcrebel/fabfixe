import moment from 'moment'

export const currencyFormatted = (amount) => {
	let i = parseFloat(amount)
	if(isNaN(i)) i = 0.00

	let minus = ''
	if(i < 0) minus = '-'

	i = Math.abs(i)
	i = parseInt((i + .005) * 100)
	i = i / 100

	let s = new String(i)
	if(s.indexOf('.') < 0) s += '.00'
	if(s.indexOf('.') === (s.length - 2))  s += '0'
	s = minus + s
	return s
}

export const calcTotal = (duration, hourlyRate) => {
  return currencyFormatted((timeMap[duration] / 60) * hourlyRate)
}

export const digitCalcTotal = (duration, hourlyRate) => {
	return currencyFormatted((duration / 60) * hourlyRate)
}

export const timeMap = {
  '30 min': 30,
  '1 hour': 60,
  '1 hour 30 min': 90,
  '2 hours': 120
}

export const formatTime = (time, duration) => {
	const tz = moment.tz.guess()
  duration = timeMap[duration] || parseInt(duration)
  if(moment(time).isMoment) return `${time.format("MM/DD/YYYY h:mma")} - ${time.add(duration, 'm').format("MM/DD/YYYY h:mma")}`
  return `${moment(time).tz(tz).format("MM/DD/YYYY h:mma") + ' ' + moment.tz(tz).zoneAbbr()} - ${moment(time).add(duration, 'm').format("MM/DD/YYYY h:mma") + ' ' + moment.tz(tz).zoneAbbr()}`
}

export const validDateSelection = (current) => {
	return current.isSameOrAfter(moment(), 'day')
}
