import nodemailer from "nodemailer";

let mail = {};

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "minbao4869@gmail.com",
    pass: "zptc ctbd omsi zkan",
  },
});

mail.sendVerification = (userEmail, verification) => {
  let mailOptions = {
    from: "minbao4869",
    to: userEmail,
    subject: "Khôi phục mật khẩu",
    text: "Mã xác nhận của ngài là: " + verification,
  };
  transporter.sendMail(mailOptions);
};

mail.sendNotificationBlock = (userEmail, reason) => {
  let mailOptions = {
    from: "minbao4869",
    to: userEmail,
    subject: "Thông báo về việc khoá tài khoản",
    text: `Tài khoản của bạn đã bị khoá với lý do: ${reason}. Nôn 100k vào Momo 0966932267 để được mở khoá tài khoản.`,
  };
  transporter.sendMail(mailOptions);
};

mail.sendNotificationUnblock = (userEmail, reason) => {
  let mailOptions = {
    from: "minbao4869",
    to: userEmail,
    subject: "Thông báo về việc mở khoá tài khoản",
    text: `Tài khoản của bạn đã được mở khoá với lý do: ${reason}. Bom hàng nữa là bị ban vĩnh viễn luôn.`,
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
