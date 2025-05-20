import express from 'express'
import multer from 'multer'
import jwt from 'jsonwebtoken';
import { Buffer } from 'buffer';
import bcrypt from 'bcryptjs';
import { Sign, Product, Wishlist, Buy, Category, SubCategory } from '../models/sign.js'

const app = express()
const key = 'jwtsecretkey'
app.use(express.json())

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'Missing token' });
    try {
        const decoded = jwt.verify(token, key)
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });

    }

}

app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        const user = await Sign.create({ email, password: hash });
        const token = jwt.sign({ id: user._id }, key);
        res.status(201).json({ message: 'Signup successful', token })

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'sign up is not successful' })

    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Sign.findOne({ email })
        if (!user) return res.status(404).json({ message: 'User not found' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user._id }, key);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'login is not success' })
    }
})

const storage = multer.memoryStorage();
const upload = multer({ storage});

app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      count: req.body.count,
      Description: req.body. Description,
      product:req.body.product,
      brand:req.body.brand,
      category: req.body.category,
      subcategory: req.body.subcategory,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find()
        const productsWithImages = products.map(product => ({
            _id: product._id,
            name: product.name,
            price: product.price,
            count: product.count,
            Description: product.Description,
            product: product.product,
            brand:product.brand,
            image: product.image?.data
                ? `data:${product.image.contentType};base64,${product.image.data.toString('base64')}`
                : null,
        }));
        res.json(productsWithImages);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Server error fetching products.' });
    }
})

app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/products/search', async (req, res) => {
    const { name } = req.query;

    try {
        const products = await Product.find({
            name: { $regex: name, $options: 'i' }
        });

        const formattedProducts = products.map((product) => ({
            ...product._doc,
            image: product.image?.data
                ? `data:${product.image.contentType};base64,${product.image.data.toString('base64')}`
                : null,
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Server error during search' });
    }
});
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const productWithImage = {
            ...product._doc,
            image: product.image?.data
                ? `data:${product.image.contentType};base64,${product.image.data.toString('base64')}`
                : null,
        };

        res.json(productWithImage);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
})

app.post('/wishlist', verifyToken, async (req, res) => {
    try {
        const { productId, name, price, image } = req.body;

        const existing = await Wishlist.findOne({ productId, userId: req.userId });
        if (existing) return res.status(409).json({ message: 'Already in wishlist' });

        const wishlistItem = new Wishlist({ productId, name, price, image, userId: req.userId });
        await wishlistItem.save();

        res.status(201).json({ message: 'Added to wishlist', wishlistItem });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


app.get('/wishlisted', verifyToken, async (req, res) => {
    try {
        const items = await Wishlist.find({ userId: req.userId }).populate('productId');
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/wishlist/delete/:name', async (req, res) => {
   try {
    const { name } = req.params;
    const deleted = await Wishlist.findOneAndDelete({ name });

    if (!deleted) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.status(200).json({ message: 'Item removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
})

app.post('/buy', verifyToken,async (req,res)=>{
    try {
    const { name, price, ram, quantity, image, productId  } = req.body;

    const newBuy = new Buy({ name, price, ram, quantity, image, productId, userId: req.userId   });
    await newBuy.save();

    res.status(201).json({ message: 'Buy data saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
})

app.get('/search/buy',verifyToken,  async (req, res) => {
  try {
    const items = await Buy.find({ userId: req.userId }).populate('productId'); 
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.delete('/buy/delete/:name', async (req, res) => {
   try {
    const { name } = req.params;
    const deleted = await Buy.findOneAndDelete({ name });

    if (!deleted) {
      return res.status(404).json({ message: 'Item not found in Cart' });
    }

    res.status(200).json({ message: 'Item removed from Cart' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
})

app.put('/product/edit:id', async (req, res) => {
    try {
        const { price, count, quantity } = req.body;

        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { price, count, quantity },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Product not found' });

        res.json({ message: 'Product updated', product: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed', error });
    }
});


app.post('/categories', async (req, res) => {
  try {
    const category = new Category({ name: req.body.name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/subcategories', async (req, res) => {
  try {
    const subcategory = new SubCategory({
      name: req.body.name,
      category: req.body.categoryId
    });
    await subcategory.save();
    res.status(201).json(subcategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/categories', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

app.get('/subcategories/:categoryId', async (req, res) => {
  const subs = await SubCategory.find({ category: req.params.categoryId });
  res.json(subs);
});

export default app;