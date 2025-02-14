import numeral from "numeral";


export function fNumber2(number: string | number) {
  return numeral(number).format('0.00');
}

export function fLotNumber(number: string | number) {
  return numeral(number).format('00000');
}
