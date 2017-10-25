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

export const parseTimeToMsec = (s: string) => s.length === 5
  ? (+s.substr(0, 2) * 60 + +s.substr(3, 2)) * 60000
  : (+s.substr(0, 2) * 3600 + +s.substr(3, 2) * 60 + +s.substr(6, 2)) * 1000;

export const parseTime = (props: { [key: string]: string | Date } = {}, startDate: string | Date) => {
  const date = props.date || startDate;
  const start = typeof date === 'string' ? Date.parse(date) : date.valueOf();
  const t = props.time || '00:00';
  const offset = typeof t === 'string' ? (t.length === 5
    ? (+t.substr(0, 2) * 60 + +t.substr(3, 2)) * 60000
    : (+t.substr(0, 2) * 3600 + +t.substr(3, 2) * 60 + +t.substr(6, 2)) * 1000) : t.valueOf();
  return start + offset;
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
};

/**
 * Replace the character at _index_ with _replacement_.
 *
 * @param {string} str
 * @param {number} index
 * @param {string} replacement
 * @returns
 */
export const replaceAt = (str: string, index = 0, replacement = '') => {
  return str.substr(0, index) + replacement + str.substr(index + replacement.length);
};


/**
 * Clean the object and remove empty properties.
 *
 * @see https://stackoverflow.com/a/286162/319711
 * @param {Object} obj
 */
export const clean = (obj: Object) => {
  const propNames = Object.getOwnPropertyNames(obj);
  for (let i = 0; i < propNames.length; i++) {
    const propName = propNames[i];
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
  return obj;
};
