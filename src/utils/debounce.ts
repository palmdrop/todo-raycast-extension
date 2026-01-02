// Based on https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940?permalink_comment_id=4276799#gistcomment-4276799
export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number
) => {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
};
