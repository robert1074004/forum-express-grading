const { Restaurant, User, Category } = require('../../models')
const { imgurFileHandler } = require('../../helpers/file-helpers')
const adminServices = require('../../services/admin-services')
const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('admins/restaurants', data))
  },
  createRestaurant: (req, res, next) => {
    return Category.findAll({ raw: true })
      .then(categories => res.render('admins/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => {
    adminServices.postRestaurants(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'restaurant was successfully created')
      res.redirect('/admin/restaurants', data)
      req.session.createdData = data
      return res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true, include: [Category] })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('admins/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    return Promise
      .all([Restaurant.findByPk(req.params.id, { raw: true }), Category.findAll({ raw: true })])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('admins/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required')
    const { file } = req
    return Promise
      .all([Restaurant.findByPk(req.params.id), imgurFileHandler(file)])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist !")
        return restaurant.update({ name, tel, address, openingHours, description, image: filePath || restaurant.image, categoryId })
      })
      .then(() => {
        req.flash('success_messages', 'Restaurant is successfully updated')
        res.redirect('/admin/restaurants/')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, (err, data) => {
      if (err) return next(err)
      req.session.deletedData = data
      return res.redirect('/admin/restaurants')
    })
  },
  getUsers: (req, res, next) => {
    return User.findAll({ raw: true })
      .then(users => res.render('admins/users', { users }))
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (user.email === 'root@example.com') throw new Error('禁止變更 root 權限')
        if (user.isAdmin) {
          return user.update({ isAdmin: false })
        }
        return user.update({ isAdmin: true })
      })
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功')
        res.redirect('/admin/users')
      })
      .catch(err => {
        req.flash('error_messages', err.message)
        res.redirect('back')
      })
  }
}
module.exports = adminController