import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";
import auth from "../middleware/auth";

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

  let images = req.file ? req.file.filename : null;

  // Kiểm tra từng trường thông tin xem có bị bỏ trống hay không
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
      errCode: 1,
      message: "Không được bỏ trống thông tin!",
    });
  }

  try {
    // Kiểm tra xem tên sản phẩm đã tồn tại trong cơ sở dữ liệu hay chưa
    let [rows, fields] = await pool.execute(
      "SELECT * FROM product WHERE name_product = ?",
      [name_product]
    );

    // Nếu tìm thấy bất kỳ kết quả nào, đó có nghĩa là tên sản phẩm đã tồn tại
    if (rows.length > 0) {
      return res.status(200).json({
        errCode: 2,
        message: "Thêm thất bại. Tên sản phẩm đã tồn tại.",
      });
    }

    // Thêm sản phẩm mới nếu không tìm thấy tên sản phẩm trong cơ sở dữ liệu
    let insert = await pool.execute(
      "INSERT INTO product (id_category,name_product, detail,content, price, images,author,id_company,year_publish,id_promotion) VALUES (?,?,?,?,?,?,?,?,?,?)",
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
      message: "Chúc mừng, bạn đã thêm sản phẩm thành công.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: 3,
      message: "Đã xảy ra lỗi trong quá trình thêm sản phẩm.",
    });
  }
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

  let images = req.file ? req.file.filename : null;

  // Kiểm tra từng trường thông tin xem có bị bỏ trống hay không
  if (
    !name_product ||
    !detail ||
    !content ||
    !price ||
    !id_category ||
    !author ||
    !id_company ||
    !year_publish ||
    !id_promotion
  ) {
    return res.status(200).json({
      errCode: 1,
      message: "Không được bỏ trống thông tin!",
    });
  }

  try {
    // Kiểm tra xem tên sản phẩm đã tồn tại trong cơ sở dữ liệu hay chưa
    let [rows, fields] = await pool.execute(
      "SELECT * FROM product WHERE name_product = ? AND id_product != ?",
      [name_product, id_product]
    );

    // Nếu tìm thấy bất kỳ kết quả nào, đó có nghĩa là tên sản phẩm đã tồn tại
    if (rows.length > 0) {
      return res.status(200).json({
        errCode: 2,
        message: "Sửa đổi không thành công. Tên sản phẩm đã tồn tại.",
      });
    }

    // Thực hiện câu lệnh UPDATE với hoặc không có hình ảnh
    if (images) {
      await pool.execute(
        "UPDATE product SET id_category=?, name_product=?, detail=?, content=?, price=?, images=?, author=?, id_company=?, year_publish=?, id_promotion=? WHERE id_product=?",
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
      await pool.execute(
        "UPDATE product SET id_category=?, name_product=?, detail=?, content=?, price=?, author=?, id_company=?, year_publish=?, id_promotion=? WHERE id_product=?",
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
      message: "Chúc mừng, bạn đã cập nhật thành công thông tin sản phẩm.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: 3,
      message: "Đã xảy ra lỗi trong quá trình cập nhật sản phẩm.",
    });
  }
};

let deleteProduct = async (req, res) => {
  let { id_product } = req.params; // id trùng tên với id đường dẫn

  // Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng hoặc đã được đặt hàng hay không
  try {
    // Kiểm tra trong bảng giỏ hàng
    let [cartRows, cartFields] = await pool.execute(
      "SELECT * FROM cart WHERE id_product = ?",
      [id_product]
    );

    // Kiểm tra trong bảng đơn hàng
    let [orderRows, orderFields] = await pool.execute(
      "SELECT * FROM order_detail WHERE id_product = ?",
      [id_product]
    );

    // Nếu sản phẩm đã tồn tại trong giỏ hàng hoặc đã được đặt hàng, không thể xóa
    if (cartRows.length > 0 || orderRows.length > 0) {
      return res.status(200).json({
        errCode: 1,
        message:
          "Xóa thất bại. Sản phẩm đã được thêm vào giỏ hàng hoặc đã được đặt hàng.",
      });
    }

    // Nếu không tồn tại trong giỏ hàng hoặc đơn hàng, thực hiện xóa sản phẩm
    let del = await pool.execute(`DELETE FROM product WHERE id_product=?`, [
      id_product,
    ]);

    return res.status(200).json({
      errCode: 0,
      message: "Chúc mừng, bạn đã xóa sản phẩm thành công.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errCode: 2,
      message: "Đã xảy ra lỗi trong quá trình xóa sản phẩm.",
    });
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

// Sản phẩm bán chạy và sản phẩm giảm giá nhiều nhất
const mostBuyProduct = async (req, res) => {
  try {
    let [most] = await pool.execute(
      `SELECT *, p.name_product, od.quantity AS total_purchased, 
      CAST((p.price - (p.price * pp.percentage / 100)) AS SIGNED) as price_reducing
      FROM product p
      JOIN order_detail od ON p.id_product = od.id_product
      JOIN orders o ON od.id_order = o.id_order
      JOIN product_promotion pp ON p.id_promotion = pp.id_promotion
      WHERE o.status = 0 AND od.quantity > 10
      ORDER BY od.quantity DESC`
    );
    return res.status(200).json({
      listMostBuyProduct: most,
    });
  } catch (e) {
    console.log(e);
  }
};

const mostReducingProduct = async (req, res) => {
  try {
    let [most] = await pool.execute(
      `SELECT *, p.id_product, p.name_product, pp.percentage,CAST((p.price - (p.price * pp.percentage / 100)) AS SIGNED) as price_reducing
        FROM product p
        JOIN product_promotion pp ON p.id_promotion = pp.id_promotion
        WHERE pp.percentage > 25;
        `
    );
    return res.status(200).json({
      listMostReducingProduct: most,
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getProduct,
  createNewProduct,
  updateProduct,
  deleteProduct,
  getDetailProduct,
  getDetail_1_Product,
  mostBuyProduct,
  mostReducingProduct,
};
