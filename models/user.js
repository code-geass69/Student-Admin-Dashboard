const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require('joi'); 

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required']
    },
    password: {
        type: String,
        required: [true, 'Password field cannot be empty']
    }
});

userSchema.statics.findAndValidate = async function(username, password) {
    const user = await this.findOne({ username });
    if (!user) {
        return null; 
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
        return user; 
    }

    return null; 
}

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const userValidationSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

userSchema.methods.validateUser = function () {
    return userValidationSchema.validate(this);
};

module.exports = mongoose.model('User', userSchema);
