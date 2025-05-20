import mongoose from "mongoose";

const signSchema = new mongoose.Schema({

    email: { type: String, required: true, },
    password: { type: String, required: true, }

})
const Sign = mongoose.model('Sign', signSchema);

const wishlistSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    price: Number,
    image: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})
const Wishlist = mongoose.model('Wishlist', wishlistSchema)

const buySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    ram: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    image: {
        type: String,
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

})
const Buy = mongoose.model('Buy', buySchema)

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
});

const Category = mongoose.model('Category', CategorySchema)

const SubcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
});

const SubCategory = mongoose.model('SubCategory', SubcategorySchema)

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  count: Number,
  image: {
        data: Buffer,
        contentType: String,
    },
  Description: String,
  product:String,
  brand:String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
});
const Product = mongoose.model('Product', ProductSchema)

export { Sign, Product, Wishlist, Buy, Category, SubCategory }