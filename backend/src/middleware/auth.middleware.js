// yaha hum 2 middlware create karenge 
// 1. jo yeh batayega ki user loggedin hai ya nhi 
// 2. woh yeh batayega ki loggedin  user owner hai ya nhi 


import jwt from 'jsonwebtoken'
import { ENV } from '../config/env.js'
import User from '../model/user.model.js'

const getRoleFromUser = (user) => {
    if (!user) return 'student'
    if (user.role) return user.role
    if (user.owner) return 'admin'
    if (user.email === ENV.ADMIN_EMAIL) return 'admin'
    return 'student'
}

const isAdminUser = (user) => {
    if (!user) return false
    return getRoleFromUser(user) === 'admin' || user.email === ENV.ADMIN_EMAIL
}

export const protectRoute =async(req ,res, next)=>{
    try {
        const authHeader = req.headers.authorization || ''
        const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
        const token = req.cookies.token || bearerToken || req.headers['x-auth-token']

        if(!token){
            return res.status(401).json({
                message:"Token not found"
            })
        }


        const decode = await jwt.verify(token, ENV.JWT_TOKEN)

        if(!decode){
            return res.status(401).json({
                message:"User not logged in "
            })
        }

        req.id = decode.userId

        const user = await User.findById(req.id)
        if (!user) {
            return res.status(401).json({
                message: "User not found"
            })
        }

        req.user = user
        next()
    } catch (error) {
        console.error(`error from protect middleware:`, error);
        return res.status(401).json({ message: "Authentication failed" });
    }
}

export const adminRoute = async(req,res, next)=>{
    const user = req.user || (req.id ? await User.findById(req.id) : null)

    if(!user){
        return res.status(401).json({
            message:"Please login as an Admin"
        })
    }

    if(isAdminUser(user)){
        next()
    } else{
        return res.status(401).json({
            message:"Access denied, Amin Only"
        })
    }
}

export const sellerOrAdminRoute = async (req, res, next) => {
    const user = req.user || (req.id ? await User.findById(req.id) : null)

    if (!user) {
        return res.status(401).json({ message: 'Please login first' })
    }

    const role = getRoleFromUser(user)
    if (role !== 'seller' && !isAdminUser(user)) {
        return res.status(403).json({ message: 'Access denied. Seller or Admin only' })
    }

    next()
}

export const approvedSellerOrAdminRoute = async (req, res, next) => {
    const user = req.user || (req.id ? await User.findById(req.id) : null)

    if (!user) {
        return res.status(401).json({ message: 'Please login first' })
    }

    if (isAdminUser(user)) {
        return next()
    }

    const role = getRoleFromUser(user)
    if (role !== 'seller') {
        return res.status(403).json({ message: 'Access denied. Seller only' })
    }

    if (!user.isApproved) {
        return res.status(403).json({ message: 'Seller profile is pending admin approval' })
    }

    next()
}