import * as moment from 'moment';

export class DateFormatValueConverter {
  public toView(value, format) {
    return moment(+value).format(format);
  }
}
