const express = require("express");
const Product = require("../models/productModel.js");
const expressAsyncHandler = require("express-async-handler");
const productRouter = express.Router();
const { isAuth, isAdmin } = require("../utils.js");

productRouter.get("/", async (req, res) => {
  const products = await Product.find();
  //cache delete
  res.setHeader("Cache-Control", "no-cache public, max-age=3600");
  res.send(products);
});
productRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({
      name: "sample name" + Date.now(),
      slug: "sample name" + Date.now(),
      image: "/images/p1.jpeg",
      price: 0,
      category: "sample category",
      brand: "sample brand",
      rating: 0,
      numReviews: 0,
      description: "sample description",
      color: [],
    });
    const product = await newProduct.save();
    res.send({ message: "상품이 생성되었습니다.", product });
  })
);
productRouter.put(
  `/:id`,
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.images = req.body.images;
      product.detailImages = req.body.detailImages;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.description = req.body.description;
      product.color = req.body.color.filter((color) => color.check === true);

      await product.save();
      res.send({ message: "상품이 업데이트되었습니다." });
    } else {
      res.status(404).send({ message: "상품을 찾을 수 없습니다." });
    }
  })
);

productRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.send({ message: "상품이 삭제되었습니다." });
    } else {
      res.status(404).send({ message: "상품을 찾을 수 없습니다." });
    }
  })
);

productRouter.post(
  "/:id/reviews",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      if (product.reviews.find((x) => x.name === req.user.name)) {
        return res.status(400).send({ message: "이미 리뷰를 남겼습니다." });
      }
      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: "리뷰가 등록됨",
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: "상품을 찾을 수 없습니다." });
    }
  })
);
const PAGE_SIZE = 3;

productRouter.get(
  "/admin",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;
    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);
productRouter.get(
  "/event",
  expressAsyncHandler(async (req, res) => {
    const { eventData } = req;
    const filter = eventData.category === "이벤트";
    res.send({ filter });
  })
);

productRouter.get(
  "/search",
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || "";
    const price = query.price || "";
    const rating = query.rating || "";
    const order = query.order || "";
    const searchQuery = query.query || "";

    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : {};
    const categoryFilter = category && category !== "all" ? { category } : {};
    const ratingFilter =
      rating && rating !== "all"
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== "all"
        ? {
            price: {
              $gte: Number(price.split("-")[0]),
              $lte: Number(price.split("-")[1]),
            },
          }
        : {};

    const sortOrder =
      order === "featured"
        ? { featured: -1 }
        : order === "lowest"
        ? { price: 1 }
        : order === "highest"
        ? { price: -1 }
        : order === "toprated"
        ? { rating: -1 }
        : order === "newest"
        ? { createdAt: -1 }
        : { _id: -1 };
    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  "/categories",
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct("category");
    res.send(categories);
  })
);

productRouter.get("/slug/:slug", async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "상품을 찾을 수 없습니다." });
  }
});

productRouter.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "상품을 찾을 수 없습니다." });
  }
});
productRouter.get("/:id", async (req, res) => {
  const productId = req.params.id;
  const colorId = productId.color; // Get the color from the query parameter

  const product = await Product.findById({ _id: productId });

  // Find the specific color within the product
  const selectedColor = product.color.find(
    (color) => color._id.toString() === colorId
  );

  if (product && selectedColor) {
    // Return the specific product and color
    res.send(selectedColor);
  } else {
    res.status(404).send({ message: "상품을 찾을 수 없습니다." });
  }
});

module.exports = productRouter;
