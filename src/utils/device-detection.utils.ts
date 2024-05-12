export function isIOS(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();

  return !!(
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /macintel/.test(userAgent))
  );
}
