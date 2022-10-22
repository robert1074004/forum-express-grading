const restaurantServices = require('../../services/restaurant-services')
const adminController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getAdminRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  }
}
module.exports = adminController
