import Axios from 'axios';
import JSSoup from 'jssoup';

const calendarName = 'swpsystemc';

interface ICalendar {
  cal: string;
  calendarIni: string;
  calendarService: string;
}

interface ICalendars {
  swpsystemb: ICalendar;
  swpsystemc: ICalendar;
}

const calendars = {
  swpsystemb: {
    cal: '21617379-33ba-41d3-b341-50b7fac01693',
    calendarIni: '1596626159288',
    calendarService: 'jsid21231',
  },
  swpsystemc: {
    cal: '693eae8c-0144-407d-92f2-725867e5be04',
    calendarIni: '1596625182764',
    calendarService: 'jsid8744009',
  },
};

const axios = Axios.create({
  baseURL: `https://${calendarName}.youcanbook.me`,
});

const fetch = async (calendar: ICalendar) => {
  const res = await axios.get('/service/jsps/cal.jsp', { params: calendar });

  return res.data;
};

const main = async (calendarName: keyof ICalendars) => {
  const calendar = calendars[calendarName];
  const res = await fetch(calendar);

  var soup = new JSSoup(res);

  const body = soup.find('body');

  const dayElems = body.findAll('div', 'gridDay');

  console.log('No of days', dayElems.length);

  // console.log(dayElems);

  return res;
};

main('swpsystemc').catch((e) => console.error(e));

// axios.get

console.log('Hello World');
