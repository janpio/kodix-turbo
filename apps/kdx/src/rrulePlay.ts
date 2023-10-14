import moment from "moment";
import { Frequency, RRule, Weekday } from "rrule";

//http://jkbrzt.github.io/rrule/
const rule = new RRule({
  wkst: RRule.MO,
  freq: Frequency.DAILY,
  dtstart: moment().startOf("week").add(1, "day").toDate(),
  until: moment().add(2, "day").toDate(),
  byweekday: [new Weekday(2)],
});

console.log(rule.all());
