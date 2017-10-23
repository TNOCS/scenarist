export const clone = (model: any) => { return JSON.parse(JSON.stringify(model)); };

/**
 * Timeout decorator for methods
 * @see https://medium.com/front-end-hacking/javascript-make-your-code-cleaner-with-decorators-d34fc72af947
 * @param milliseconds
 */
export const timeout = (milliseconds = 0) => {
  return function (target, key, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
      setTimeout(() => {
        originalMethod.apply(this, args);
      }, milliseconds);
    };
    return descriptor;
  };
};

export const pad = (n: number, width = 2, z = '0') => {
  const str = `${n}`;
  return str.length >= width ? str : new Array(width - str.length + 1).join(z) + n;
};

/**
 * Parse date strings back to dates in the JSON parser.
 * Use: JSON.parse(json, dateParser);
 *
 * @see https://stackoverflow.com/questions/14488745/javascript-json-date-deserialization
 */
export const dateParser = () => {
  const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
  const reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

  return (key, value) => {
    // first, just make sure the property is a string:
    if (typeof value === 'string') {
      // then, use regex to see if it's an ISO-formatted string
      let a = reISO.exec(value);
      if (a) {
        // if so, Date() can parse it:
        return new Date(value);
      }
      // otherwise, see if it's a wacky Microsoft-format string:
      a = reMsAjax.exec(value);
      if (a) {
        // and perform some jujitsu to make use of it:
        const b = a[1].split(/[-+,.]/);
        return new Date(b[0] ? +b[0] : 0 - +b[1]);
      }
      // here, you could insert any additional tests and parse instructions you like, for other date syntaxes...
    }
    // important: you need to return any values you're not parsing, or they die...
    return value;
  };
}
