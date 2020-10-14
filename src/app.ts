import Axios from 'axios';
import url from 'url';
import moment from 'moment';

const JSSoup = require('jssoup').default;

interface ICalendar {
  cal: string;
  ini: string;
  service: string;
  jumpDate?: string;
}

interface ICalendars {
  swpsystemb: ICalendar;
  swpsystemc: ICalendar;
}

interface ISlot {
  startTime: string;
  bookingLink: string;
}

const calendars = {
  swpsystemb: {
    cal: '21617379-33ba-41d3-b341-50b7fac01693',
    ini: '1596626159288',
    service: 'jsid21231',
  },
  swpsystemc: {
    cal: '693eae8c-0144-407d-92f2-725867e5be04',
    ini: '1602684055670',
    service: 'jsid8744009',
  },
};

const fetch = async (calendarName: keyof ICalendars, dayInc: number | null = null) => {
  const calendar = calendars[calendarName];
  let axios = Axios.create({
    baseURL: getBaseUrl(calendarName),
  });
  // const jumpDate = '2020-10-21';
  const params: ICalendar = calendar;

  if (dayInc) {
    const jumpDate = moment().add(dayInc, 'days').format('YYYY-MM-DD');

    console.log('jumpDate');
    console.log(jumpDate);
    params.jumpDate = jumpDate;
  }

  const res = await axios.get('/service/jsps/cal.jsp', { params });

  console.log(res.request.res.responseUrl);

  return res.data;
};

const getBaseUrl = (calendarName: string) => {
  return `https://${calendarName}.youcanbook.me`;
};

const mapToAvailableSlots = (response: any) => {
  var soup = new JSSoup(response);
  const body = soup.find('body');
  const dayElems = body.findAll('div', 'gridDay') as any[];
};

const main = async (calendarName: keyof ICalendars) => {
  const availableSlots = [] as ISlot[];

  let dayElements = [] as any[];

  const responses = await Promise.all([fetch(calendarName), fetch(calendarName, 7)]);

  responses.forEach((res) => {
    var soup = new JSSoup(res);
    const body = soup.find('body');
    const dayElems = body.findAll('div', 'gridDay') as any[];
    dayElements = dayElements.concat(dayElems);
  });

  console.log('No of days found', dayElements.length);

  dayElements.forEach((day, i) => {
    // const freeSlots = day.findAll('div', 'gridFree') as any[];
    const freeSlots = day.findAll('div', { class: ['gridFree', 'gridSlot'] }) as any[];

    freeSlots.forEach((freeSlot) => {
      const linkElem = freeSlot.find('a');

      // ToDo find proper way to this
      const bookingLink = getBaseUrl(calendarName) + linkElem.attrs.href.replace(/&amp;/g, '&');
      const bookingUrl = url.parse(bookingLink, true);

      const bookingSlot = bookingUrl?.query?.slot;

      const startTime = moment.unix(+bookingSlot / 1000).toString();
      availableSlots.push({ startTime, bookingLink });
      //
    });

    // console.log(i, freeSlots.length);
  });

  return availableSlots;
};

main('swpsystemc')
  .then((availableSlots: ISlot[]) => {
    console.log(availableSlots);
  })
  .catch((e) => console.error(e));

console.log('Hello World 2');
