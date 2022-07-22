const userSchema = require('../models/userModel')
const checkForUser = async (user)=>{
    const query = {'alias' : user.alias, 'email': user.email}
    const res = await userSchema.findOne(query).lean()
    if(res.length>0)
        return true
    return false
}
module.exports.checkForUser = checkForUser