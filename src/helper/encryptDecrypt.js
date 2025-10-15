const CryptoJS = require("crypto-js");
const encryptReactPassword = process.env.REACT_APP_ENCRYPT_PASSWORD ? process.env.REACT_APP_ENCRYPT_PASSWORD : "pimptupEncryption";

const encryptEmail = (email) => {
    return CryptoJS.AES.encrypt(email, encryptReactPassword).toString();
};

const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, encryptReactPassword).toString();
};

const decryptEmail = (email) => {
    var byteEmail   =    CryptoJS.AES.decrypt(email, encryptReactPassword);
    return byteEmail.toString(CryptoJS.enc.Utf8);
}

const decryptPassword = (password) => {
    var bytePasssword   =    CryptoJS.AES.decrypt(password, encryptReactPassword);
    return bytePasssword.toString(CryptoJS.enc.Utf8);
}


export default { encryptEmail, encryptPassword, decryptEmail, decryptPassword }