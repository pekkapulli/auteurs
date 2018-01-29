export const isTouch = !!('ontouchstart' in window);

// tslint:disable:no-bitwise

// From https://github.com/darkskyapp/string-hash
export default function stringToNumberHash(input: string) {
  let output = 5381;
  let i = input.length;

  while (i) {
    output = (output * 33) ^ input.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return output >>> 0;
}
