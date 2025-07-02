const tailwindcss = require('@tailwindcss/postcss');

// module.exports = {
//   plugins: [
//     tailwindcss(),
//     require('autoprefixer'),
//   ],
// };
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
}
