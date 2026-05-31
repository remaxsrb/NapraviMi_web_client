export const RegexPatterns = {
  PASSWORD: /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/,
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{2,})+$/,

  STREET_NAME: /^([A-Za-z]+(?:\s+[A-Za-z]+)*)$/,
  STREET_NUMBER: /^(\d{1,3}[a-zA-Z]?)$/,

  PHONE_NUMBER: /^06\d{7,8}$/,
  cardPatterns: {
    MASTERCARD: /^5[1-5][0-9]{14}$/, //5555555555554444
    VISA: /^(4539|4556|4916|4532|4929|4485|4716)[0-9]{12}$/, //4539454545454545
    DINERS: /^(300|301|302|303|36|38)[0-9]{12}$/, //30123456789012
  },
  FILE_FORMAT: /\.(png|jpg)$/i,
  JSON: /\.json$/,
};
