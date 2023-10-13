import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";
import userService from "../services/userService";
import auth from "../middleware/auth";
//API login
let handleLogin = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      errCode: 1,
      message: "Ngài đã nhập thiếu email hoặc password",
    });
  }
  console.log("Phong: ", req.body);
  //console.log(req.body);
  //Trả về dữ liệu người dùng
  let userData = await userService.handleUserLogin(email, password);
  return res.status(200).json({
    // errorCode: 0,
    // message: 'Hello Phong',
    // email: email,
    // test: 'Đăng nhập thành công'
    errCode: userData.errCode,
    message: userData.message,
    userData: userData.user,
    role_id: userData.role_id,
  });
};

let handleAdminLogin = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      errCode: 1,
      message: "Ngài nhập thiếu email hoặc password",
    });
  }
  console.log("Phong: ", req.body);
  //console.log(req.body);
  //Trả về dữ liệu người dùng
  let userData = await userService.handleAdminLogin(email, password);
  return res.status(200).json({
    // errorCode: 0,
    // message: 'Hello Phong',
    // email: email,
    // test: 'Đăng nhập thành công'
    errCode: userData.errCode,
    message: userData.message,
    userData: userData.user,
    role_id: userData.role_id,
  });
};

// Nhà xuất bản
let getNXB = async (req, res) => {
  //thực thi lênh sql
  try {
    let id = req.query.id;
    console.log(id);
    console.log("id query: ", id);
    let response = "";
    if (id === "ALL") {
      [response] = await pool.execute("select * from publishing_company");
    } else {
      [response] = await pool.execute(
        "select * from publishing_company where id_company=?",
        [id]
      );
    }
    console.log(response);
    return res.status(200).json({ listNXB: response });
  } catch (error) {
    console.log(error);
  }
};

let createNewNXB = async (req, res) => {
  let { name_company, phone_company, email_company, address_company } =
    req.body;
  console.log("Body:", req.body);

  //bắt lỗi trống thông tin
  if (!name_company || !phone_company || !email_company || !address_company) {
    return res.status(200).json({
      errCode: 2,
      message: "Không được bỏ trống thông tin!",
    });
  }

  //thực thi lênh sql
  let insert = await pool.execute(
    "insert into publishing_company (name_company,phone_company,email_company,address_company) values (?,?,?,?)",
    [name_company, phone_company, email_company, address_company]
  );
  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã thêm thành công",
  });
};

let updateNXB = async (req, res) => {
  let { name_company, phone_company, email_company, address_company } =
    req.body;
  console.log("Body:", req.body);
  let id_company = req.params.id_company;
  //bắt lỗi trống thông tin
  let update = await pool.execute(
    "update publishing_company set name_company=?,phone_company=?,email_company=?,address_company=? where id_company=?",
    [name_company, phone_company, email_company, address_company, id_company]
  );
  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã cập nhật thành công",
  });
};

let deleteNXB = async (req, res) => {
  let { id_company } = req.params; // id trùng tên với id đường dẫn

  if (!id_company) {
    return res.status(200).json({
      errCode: 1,
      message: "Thất bại rồi",
    });
  }

  try {
    let del = await pool.execute(
      `delete from publishing_company where id_company=?`,
      [id_company]
    );
  } catch (err) {
    return res.status(200).json({
      errCode: 1,
      message: "Ngài không thể xoá NXB đã được sử dụng",
    });
  }

  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã xóa thành công",
  });
};

//Giảm giá sách
let getPromotionProduct = async (req, res) => {
  try {
    let id = req.query.id;
    console.log(id);
    console.log("id promotion: ", id);
    let response = "";
    if (id === "ALL") {
      [response] = await pool.execute("select * from product_promotion");
    } else {
      [response] = await pool.execute(
        "select * from product_promotion where id_promotion=?",
        [id]
      );
    }
    console.log(response);
    return res.status(200).json({ listPromotionProduct: response });
  } catch (error) {
    console.log(error);
  }
};

let createNewPromotionProduct = async (req, res) => {
  let { percentage, start_date, end_date } = req.body;
  console.log("Body:", req.body);

  //bắt lỗi trống thông tin
  if (!percentage || !start_date || !end_date) {
    return res.status(200).json({
      errCode: 2,
      message: "Không được bỏ trống thông tin!",
    });
  }

  //thực thi lênh sql
  let insert = await pool.execute(
    "insert into product_promotion (percentage,start_date,end_date) values (?,?,?)",
    [percentage, start_date, end_date]
  );
  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã thêm thành công",
  });
};

let updatePromotionProduct = async (req, res) => {
  let { percentage, start_date, end_date } = req.body;
  console.log("Body:", req.body);
  let id_promotion = req.params.id_promotion;

  //bắt lỗi trống thông tin

  //thực thi lênh sql
  let update = await pool.execute(
    "update product_promotion set percentage=?,start_date=?,end_date=? where id_promotion=?",
    [percentage, start_date, end_date, id_promotion]
  );
  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã cập nhật thành công",
  });
};

let deletePromotionProduct = async (req, res) => {
  let { id_promotion } = req.params; // id trùng tên với id đường dẫn

  if (!id_promotion) {
    return res.status(200).json({
      errCode: 1,
      message: "Thất bại rồi",
    });
  }

  try {
    let del = await pool.execute(
      `delete from product_promotion where id_promotion=?`,
      [id_promotion]
    );
  } catch (err) {
    return res.status(200).json({
      errCode: 1,
      message: "Ngài không thể xoá mã giảm giá sách đã được sử dụng",
    });
  }

  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã xóa thành công",
  });
};

//Sản phẩm
let getProduct = async (req, res) => {
  //const [rows, fields] = await pool.execute('SELECT * FROM product');
  const [data] = await pool.execute(
    "SELECT * FROM `product` ORDER BY id_category ASC;"
  );
  //verify
  return res.status(200).json({
    dataProduct: data,
    //test: 'OK'
  });
};

let createNewProduct = async (req, res) => {
  let {
    name_product,
    detail,
    content,
    price,
    id_category,
    author,
    id_company,
    year_publish,
    id_promotion,
  } = req.body;
  console.log("Body:", req.body);
  console.log("Req.file: ", req.file);

  let images = req.file.filename;

  //bắt lỗi trống thông tin
  if (
    !name_product ||
    !detail ||
    !content ||
    !price ||
    !images ||
    !id_category ||
    !author ||
    !id_company ||
    !year_publish ||
    !id_promotion
  ) {
    return res.status(200).json({
      errCode: 2,
      message: "Không được bỏ trống thông tin!",
    });
  }

  //thực thi lênh sql
  let insert = await pool.execute(
    "insert into product (id_category,name_product, detail,content, price, images,author,id_company,year_publish,id_promotion) values (?,?,?,?,?,?,?,?,?,?)",
    [
      id_category,
      name_product,
      detail,
      content,
      price,
      images,
      author,
      id_company,
      year_publish,
      id_promotion,
    ]
  );
  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã thêm thành công",
  });
};

let updateProduct = async (req, res) => {
  let {
    name_product,
    detail,
    content,
    price,
    id_category,
    author,
    id_company,
    year_publish,
    id_promotion,
  } = req.body;

  let id_product = req.params.id_product;

  console.log("Body:", req.body);
  console.log("Req.file: ", req.file);

  // let id_category_param = req.params.id_category;
  let update = "";

  if (req.file && req.file.filename) {
    let images = req.file.filename;
    update = await pool.execute(
      "update product set id_category=?, name_product=?,detail=?,content=?,price=?,images=?,author=?,id_company=?,year_publish=?,id_promotion=? where id_product=?",
      [
        id_category,
        name_product,
        detail,
        content,
        price,
        images,
        author,
        id_company,
        year_publish,
        id_promotion,
        id_product,
      ]
    );
  } else {
    update = await pool.execute(
      "update product set id_category=?, name_product=?,detail=?,content=?,price=?,author=?,id_company=?,year_publish=?,id_promotion=? where id_product=?",
      [
        id_category,
        name_product,
        detail,
        content,
        price,
        author,
        id_company,
        year_publish,
        id_promotion,
        id_product,
      ]
    );
  }
  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã cập nhật thành công",
  });
};

let deleteProduct = async (req, res) => {
  let { id_product } = req.params; // id trùng tên với id đường dẫn

  if (!id_product) {
    return res.status(200).json({
      errCode: 1,
      message: "Thất bại rồi",
    });
  }

  let del = await pool.execute(`delete from product where id_product=?`, [
    id_product,
  ]);

  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã xóa thành công",
  });
};

//Danh mục
let getCategory = async (req, res) => {
  //thực thi lênh sql
  try {
    let id = req.query.id;
    console.log(id);
    console.log("id query: ", id);
    let response = "";
    if (id === "ALL") {
      [response] = await pool.execute("select * from category");
    } else {
      [response] = await pool.execute(
        "select * from category where id_category=?",
        [id]
      );
    }
    console.log(response);
    return res.status(200).json({ listCategory: response });
  } catch (error) {
    console.log(error);
  }
};

let createNewCategory = async (req, res) => {
  let name_category = req.body.name_category;
  // let logo = req.file.filename
  //bắt lỗi trống thông tin
  if (!req.file || !name_category) {
    return res.status(200).json({
      errCode: 2,
      message: "Ngài không được bỏ trống thông tin",
    });
  }
  console.log("File", req.file);

  let logo = req.file.filename;
  console.log("Check", name_category, logo);
  //thực thi lênh sql
  try {
    let insert = await pool.execute(
      "insert into category (name_category,logo) values (?,?)",
      [name_category, logo]
    );
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: 1,
      message: "Thêm thất bại. Tên danh mục đã tồn tại",
    });
  }

  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã thêm thành công",
  });
};

let updateCategory = async (req, res) => {
  let { name_category } = req.body;
  let id_category = req.query.id;
  let update = "";
  if (req.file && req.file.filename) {
    let logo = req.file.filename;

    update = await pool.execute(
      "update category set name_category=?,logo=? where id_category=?",
      [name_category, logo, id_category]
    );
    console.log(
      "name: ",
      name_category,
      "Lo go :",
      logo,
      "id_category: ",
      id_category
    );
    // if (!name || !logo || !id_category) {
    //     return res.status(200).json({
    //         message: "Không được bỏ trống thông tin"
    //     })
    // }
  } else {
    update = await pool.execute(
      "update category set name_category=? where id_category=?",
      [name_category, id_category]
    );
  }
  return res.status(200).json({
    message: "Chúc mừng ngài đã cập nhật thành công",
  });
};

let deleteCategory = async (req, res) => {
  try {
    let { id_category } = req.query; // id trùng tên với id đường dẫn
    console.log(req.query);
    if (!id_category) {
      return res.status(200).json({
        message: "Thất bại rồi",
      });
    }

    // Kiểm tra xem danh mục có sản phẩm không
    const [rows, fields] = await pool.execute(
      `SELECT COUNT(*) AS productCount FROM product WHERE id_category = ?`,
      [id_category]
    );

    if (rows[0].productCount > 0) {
      return res.status(201).json({
        message: "Không thể xoá vì đã có sản phẩm trong danh mục này.",
      });
    }

    // Nếu không có sản phẩm, thì tiến hành xoá danh mục
    let del = await pool.execute(`DELETE FROM category WHERE id_category=?`, [
      id_category,
    ]);
  } catch (err) {
    console.log(err);
  }
  return res.status(200).json({
    message: "Chúc mừng bạn đã xóa thành công",
  });
};

//Khuyến mãi
let getDiscount = async (req, res) => {
  try {
    let id = req.query.id;
    console.log(id);
    console.log("id discount: ", id);
    let response = "";
    if (id === "ALL") {
      [response] = await pool.execute("select * from discount");
    } else {
      [response] = await pool.execute(
        "select * from discount where discount_id=?",
        [id]
      );
    }
    console.log(response);
    return res.status(200).json({ listDiscount: response });
  } catch (error) {
    console.log(error);
  }
};

let createNewDiscount = async (req, res) => {
  let { discount_code, percentage, start_date, end_date, description } =
    req.body;
  console.log("Phong body:", req.body);

  //bắt lỗi trống thông tin
  if (
    !discount_code ||
    !percentage ||
    !start_date ||
    !end_date ||
    !description
  ) {
    return res.status(200).json({
      errCode: 2,
      message: "Không được bỏ trống thông tin!",
    });
  }

  //thực thi lênh sql
  let insert = await pool.execute(
    "insert into discount (discount_code,percentage,start_date,end_date,description) values (?,?,?,?,?)",
    [discount_code, percentage, start_date, end_date, description]
  );
  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã thêm thành công",
  });
};

let updateDiscount = async (req, res) => {
  let { discount_code, percentage, start_date, end_date, description } =
    req.body;

  let discount_id = req.params.discount_id;

  // if (
  //   !discount_code ||
  //   !percentage ||
  //   !start_date ||
  //   !end_date ||
  //   !description ||
  //   !discount_id
  // ) {
  //   return res.status(201).json({
  //     errCode: 1,
  //     message: "Không được bỏ trống thông tin",
  //   });
  // }
  let update = await pool.execute(
    "update discount set discount_code=?,percentage=?,start_date=?,end_date=?,description=? where discount_id=?",
    [discount_code, percentage, start_date, end_date, description, discount_id]
  );
  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã cập nhật thành công",
  });
};

let deleteDiscount = async (req, res) => {
  let { discount_id } = req.params; // id trùng tên với id đường dẫn

  if (!discount_id) {
    return res.status(200).json({
      errCode: 1,
      message: "Thất bại rồi",
    });
  }

  try {
    let del = await pool.execute(`delete from discount where discount_id=?`, [
      discount_id,
    ]);
  } catch (err) {
    return res.status(200).json({
      errCode: 1,
      message: "Ngài không thể xoá mã giảm giá đã được sử dụng",
    });
  }

  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng ngài đã xóa thành công",
  });
};

let getDiscountByCode = async (req, res) => {
  //thực thi lênh sql
  try {
    let code = req.query.discount_code;
    console.log(code);
    console.log("code : ", code);
    let [response] = await pool.execute(
      "select * from discount where discount_code=?",
      [code]
    );
    console.log(response);
    return res
      .status(200)
      .json({ data: response.length > 0 ? response[0] : {} });
  } catch (error) {
    console.log(error);
  }
};

let getDetailProduct = async (req, res) => {
  //thực thi lênh sql
  try {
    let id = req.query.id;
    console.log(id);
    console.log("id query: ", id);
    let response = "";
    if (id === "ALL") {
      [response] = await pool.execute(
        "select *,p.name_product as name_product, CAST((p.price - (p.price * pc.percentage / 100)) AS SIGNED) as price_reducing from product p,category c, product_promotion pc,publishing_company e where p.id_category=c.id_category and p.id_promotion=pc.id_promotion and e.id_company=p.id_company"
      );
    } else {
      [response] = await pool.execute(
        "select *,p.name_product as name_product,CAST((p.price - (p.price * pc.percentage / 100)) AS SIGNED) as price_reducing from product p,category c,product_promotion pc where p.id_category=? and p.id_category=c.id_category and p.id_promotion=pc.id_promotion",
        [id]
      );
    }
    console.log(response);
    return res.status(200).json({ listProduct: response });
  } catch (error) {
    console.log(error);
  }
};

let getDetail_1_Product = async (req, res) => {
  //thực thi lênh sql
  try {
    let id = req.query.id;
    console.log(id);
    console.log("id query: ", id);
    let response = "";
    if (id === "ALL") {
      [response] = await pool.execute(
        "select *,p.name_product as name_product, CAST((p.price - (p.price * pc.percentage / 100)) AS SIGNED) as price_reducing from product p, product_promotion pc where p.id_promotion=pc.id_promotion"
      );
    } else {
      [response] = await pool.execute(
        "select *,p.name_product as name_product, CAST((p.price - (p.price * pc.percentage / 100)) AS SIGNED) as price_reducing from product p, product_promotion pc, publishing_company c where p.id_promotion=pc.id_promotion and c.id_company=p.id_company and id_product=?",
        [id]
      );
    }
    console.log(response);
    return res.status(200).json({ listProduct: response });
  } catch (error) {
    console.log(error);
  }
};

let rateComment = async (req, res) => {
  try {
    let { id_product, star, comment } = req.body;
    let id_account = auth.tokenData(req).id_account;
    console.log("id_product:", id_product, "star", star, "omment", comment);
    console.log("id_account:", id_account);
    let check = await checkTonTaiDanhGia(id_product, id_account);
    console.log(check);
    if (!check) {
      let insert = await pool.execute(
        "insert into rated(id_product,id_account,star,comment,status) values(?,?,?,?,0)",
        [id_product, id_account, star, comment]
      );

      return res.status(200).json({
        // insert: insert,
        message: "Chúc mừng ngài đã thêm thành công",
      });
    } else {
      console.log(check);
      return res.status(200).json({
        // insert: insert,
        message: "Đã bình luận",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

let checkTonTaiDanhGia = async (id_product, id_account) => {
  try {
    let [check] = await pool.execute(
      "select * from rated where id_product=? and id_account=?",
      [id_product, id_account]
    );
    console.log(check[0]);
    if (!check[0]) {
      return false;
    } else {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
};

let getRated = async (req, res) => {
  try {
    let { id_product } = req.query;

    // let insert = await pool.execute('insert into rated(id_product,id_account,star,comment,status) values(?,?,?,?,0)', [id_product, id_account, star, comment])
    let [listRated] = await pool.execute(
      "SELECT * FROM rated r ,account a where id_product=? and r.id_account=a.id_account",
      [id_product]
    );

    return res.status(200).json({
      // insert: insert,
      listRated: listRated,
    });
  } catch (e) {
    console.log(e);
  }
};

let getCategoryPhong = async (req, res) => {
  //thực thi lênh sql
  try {
    let page = req.query.page; //Trang mấy
    let page_size = 5;
    page = parseInt(page);
    let soLuongBoQua = (page - 1) * page_size;

    console.log("id query: ", page, "So luong bo qua:", soLuongBoQua);
    let response = "";
    if (!page) {
      [response] = await pool.execute("select * from category");
    } else {
      [response] = await pool.execute("select * from category");
      console.log(response);
      response = response.slice(soLuongBoQua, page_size + soLuongBoQua);
    }
    // response = response.slice(4, 5)
    return res.status(200).json({
      listCategory: response,
      page_size: page_size,
    });
  } catch (error) {
    console.log(error);
  }
};

let getProductPhong = async (req, res) => {
  //thực thi lênh sql
  try {
    let page = req.query.page; //Trang mấy
    let page_size = 6;
    page = parseInt(page);
    let soLuongBoQua = (page - 1) * page_size;

    console.log("id query: ", page, "So luong bo qua:", soLuongBoQua);
    let response = "";
    if (!page) {
      [response] = await pool.execute(
        "select *,p.name_product as name_product from product p,category c where p.id_category=c.id_category"
      );
    } else {
      [response] = await pool.execute(
        "select *,p.name_product as name_product from product p,category c where p.id_category=c.id_category"
      );
      console.log(response);
      response = response.slice(soLuongBoQua, page_size + soLuongBoQua);
    }
    // response = response.slice(4, 5)
    return res.status(200).json({
      listProduct: response,
      page_size: page_size,
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  handleLogin,
  getProduct,
  createNewProduct,
  updateProduct,
  deleteProduct,
  getDetailProduct,
  getDetail_1_Product,
  getCategory,
  createNewCategory,
  updateCategory,
  deleteCategory,
  getNXB,
  createNewNXB,
  updateNXB,
  deleteNXB,
  getPromotionProduct,
  createNewPromotionProduct,
  updatePromotionProduct,
  deletePromotionProduct,
  handleAdminLogin,
  rateComment,
  getRated,
  getCategoryPhong,
  getProductPhong,
  getDiscount,
  createNewDiscount,
  updateDiscount,
  deleteDiscount,
  getDiscountByCode,
};
