export const isCardExpired = (expirationDate: string) => {
  const parts = expirationDate.split('/');
  const month = parseInt(parts[0], 10);
  const year = parseInt(`20${parts[1]}`, 10);

  const dateOfExpiration = new Date(year, month, 0);

  const currentDate = new Date();

  return currentDate > dateOfExpiration;
};
