export const getAccountString = (account) => {
  const len = account.length;
  return `0x${account.substr(2, 3).toUpperCase()}...${account
    .substr(len - 3, len - 1)
    .toUpperCase()}`;
};

export const formatLargeNumber = (number) => {
  const numberOfDigits = number.length;
  if (numberOfDigits > 5) {
    const firstPart = number.slice(0, 3);
    const firstPartFormatted = (Number(firstPart) / 100).toFixed(2);
    return `${firstPartFormatted} * 10^${numberOfDigits - 1}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0
  }).format(Number(number));
};
