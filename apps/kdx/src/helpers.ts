import moment from "moment";
import type { RRule } from "rrule";

/**
 * @description rrule.toText() returns the text based on the UTC timezone. This function returns the text based on the local timezone.
 */
export function tzOffsetText(rule: RRule) {
  const tzOffset = moment().utcOffset();
  const newRRule = rule.clone();
  newRRule.options.until = newRRule.options.until
    ? moment(rule.options.until).add(tzOffset, "minutes").toDate()
    : null;
  return newRRule.toText();
}
