import numeral from 'numeral';

export class NumberFormatValueConverter {
  public toView(value, format) {
    return numeral(value).format(format);
  }
}
