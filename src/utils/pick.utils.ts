// =============================================
// Pick the keys from an object
// =============================================
export const pick = (
  obj: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> => {
  const finalObj: Record<string, unknown> = {};
  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }
  return finalObj;
};
