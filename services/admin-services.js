const { Restaurant, Category } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { imgurFileHandler } = require('../helpers/file-helpers')
const adminServices = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 5
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    return Restaurant.findAndCountAll({ limit, offset, raw: true, nest: true, include: [Category] })
      .then(restaurants => { return cb(null, { restaurants: restaurants.rows, pagination: getPagination(limit, page, restaurants.count) }) })
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) {
          const err = new Error("Restaurant didn't exist !")
          err.status = 404
          throw err
        }
        return restaurant.destroy()
      })
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required')
    const { file } = req
    return imgurFileHandler(file)
      .then(filePath => {
        return Restaurant.create({ name, tel, address, openingHours, description, image: filePath || null, categoryId })
      })
      .then(newRestaurant => cb(null, { restaurant: newRestaurant }))
      .catch(err => cb(err))
  }
}
module.exports = adminServices
