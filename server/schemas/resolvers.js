const { AuthenticationError } = require("apollo-server-express");
const { User, Product, Category } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    categories: async () => {
      return await Category.find();
    },
    products: async (parent, { category, name }) => {
      const params = {};

      if (category) {
        params.category = category;
      }

      if (name) {
        params.name = {
          $regex: name,
        };
      }

      return await Product.find(params).populate("category");
    },
    product: async (parent, { _id }) => {
      return await Product.findById(_id).populate("category");
    },
    // STEPHEN WAS HERE!!! I'm still working on this
    // user: async (parent, args, context) => {
    //     if (context.user) {
    //         const userLogin = await User.findById(context.user._id).populate({

    //         })
    //     }
    // }
  },

  Mutation: {
    addUser: async (parent, args) => {
      const userName = await User.create(args);
      const token = signToken(userName);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const userName = await User.findOne({ email });

      if (!userName) {
        throw new AuthenticationError("Invalid user!");
      }

      const correctPw = await userName.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Invalid password!");
      }

      const token = signToken(userName);

      return { token, userName };
    },
    // add a product
    addProduct: async (parent, args) => {
      const product = await Product.create(args);

      return product;
    },
    // update products by their ID
    updateProduct: (parent, args, context, info) => {
      console.log(args);
      Product.findByIdAndUpdate(
        args._id,
        {
          $set: {
            name: args.productInput.name,
            description: args.productInput.description,
            quantity: args.productInput.quantity,
            price: args.productInput.price,
          },
        },
        { new: true }
      )
        .then((result) => {
          console.log(result);
          return {
            ...result._doc,
          };
        })
        .catch((err) => {
          throw err;
        });
    },
  },
};

module.exports = resolvers;
