import nodemailer from "nodemailer";

let mail = {};

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "minbao1412@gmail.com",
    pass: "dinhbaominh4869",
  },
});

mail.sendVerification = (userEmail, verification) => {
  let mailOptions = {
    from: "minbao1412@gmail.com",
    to: userEmail,
    subject: "Khôi phục mật khẩu",
    text: "Mã xác nhận của ngài là : " + verification,
  };
  transporter.sendMail(mailOptions);
};

mail.createCode = () => {
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += String(Math.floor(Math.random() * 10));
  }
  return result;
};

module.exports = mail;
