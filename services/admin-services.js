const { Restaurant, Category } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const adminServices = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 5
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    return Restaurant.findAndCountAll({ limit, offset, raw: true, nest: true, include: [Category] })
      .then(restaurants => { return cb(null, { restaurants: restaurants.rows, pagination: getPagination(limit, page, restaurants.count) }) })
      .catch(err => cb(err))
  }
}
module.exports = adminServices
