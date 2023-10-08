import moment from "moment";
import { Frequency, RRule } from "rrule";

const rule = new RRule({
  freq: Frequency.DAILY,
  dtstart: moment().toDate(),
  until: moment().add(1, "day").toDate(),
});

console.log(rule.all());
