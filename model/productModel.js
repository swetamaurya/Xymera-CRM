const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String  },
    status: { type: String, default: "Inactive" },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

const productSchema = new mongoose.Schema(
  {
    name: { type: String  },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category'  },
    status: { type: String, default: "Inactive" },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = { Category, Product };
