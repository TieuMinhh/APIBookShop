import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";

// Phân trang
let getCategoryByPages = async (req, res) => {
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

let getProductByPages = async (req, res) => {
  try {
    let page = req.query.page; //Trang mấy
    let page_size = 8;
    page = parseInt(page);

    console.log("id query: ", page);

    let response = [];
    if (!page) {
      [response] = await pool.execute(
        "select *,p.name_product as name_product, CAST((p.price - (p.price * pc.percentage / 100)) AS SIGNED) as price_reducing from product p,category c, product_promotion pc,publishing_company e where p.id_category=c.id_category and p.id_promotion=pc.id_promotion and e.id_company=p.id_company LIMIT ?",
        [page_size]
      );
    } else {
      let offset = (page - 1) * page_size;
      [response] = await pool.execute(
        "select *,p.name_product as name_product, CAST((p.price - (p.price * pc.percentage / 100)) AS SIGNED) as price_reducing from product p,category c, product_promotion pc,publishing_company e where p.id_category=c.id_category and p.id_promotion=pc.id_promotion and e.id_company=p.id_company LIMIT ? OFFSET ?",
        [page_size, offset]
      );
    }

    return res.status(200).json({
      listProduct: response,
      page_size: response.length,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getCategoryByPages,
  getProductByPages,
};
