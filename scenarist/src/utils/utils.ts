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
