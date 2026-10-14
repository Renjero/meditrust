import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../../models/userModel.js"

const registerUser = async (req, res) => {

    // Check if all fileds are coming
    const { name, email, phone, password } = req.body

    if (!name || !email || !phone || !password) {
        res.status(409)
        throw new Error("Please fill all details!!!")
    }


    // Check if user exist
    const emailExist = await User.findOne({ email })
    const phoneExist = await User.findOne({ phone })


    if (emailExist || phoneExist) {
        res.status(409)
        throw new Error("User Already Exists!")
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const user = await User.create({ name, email, phone, password: hashedPassword })

    if (!user) {
        res.status(409)
        throw new Error("User Not Registered!")
    }


    res.status(201).json({
        message: "Account Succesfully Has Been Created!"
    })
}

const loginUser = async (req, res) => {

    // Check if all fileds are coming
    const { email, password } = req.body

    if (!email || !password) {
        res.status(409)
        throw new Error("Please fill all details!!!")
    }

    // Check if user exists
    const user = await User.findOne({ email })

    if (user && await bcrypt.compare(password, user.password)) {
        res.status(200).json({
            name: user.name,
            email: user.email,
            phone: user.phone,
            userType: user.userType,
            createdAt: user.createdAt,
            token: generateToken(user._id)
        })
    } else {
        res.status(401)
        throw new Error("Invalid Credentials")
    }

}


const getMyProfile = async (req, res) => {
    res.status(200).json(req.user)
}


const updateProfile = async (req, res) => {

    const { userType } = req.body

    if (userType) {
        res.status(401)
        throw new Error("Only Admin Can Change User Type!!!")
    }

    let user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error("No User Found!")
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, req.body, { new: true })

    if (!updatedUser) {
        res.status(409)
        throw new Error("User Not Updated!")
    }

    res.status(200).json(updatedUser)
}


//CHANGE OLD PASSWORD TO NEW !REST BY LINK OR MAILS ETC ARE INCLUDED
// PASSWORD WILL ONLY CHANGE IF YOU KNOW THE OLD PASSWORD

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body

    // Check if both passwords are provided
    if (!currentPassword || !newPassword) {
        res.status(400)
        throw new Error("Please provide both passwords!")
    }

    // Check new password length
    if (newPassword.length < 8) {
        res.status(400)
        throw new Error("New password must be at least 8 characters!")
    }

    // Find the logged-in user
    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error("User Not Found!")
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
        currentPassword,
        user.password
    )

    if (!isMatch) {
        res.status(401)
        throw new Error("Current Password Is Incorrect!")
    }

    // Prevent using the same password again
    const samePassword = await bcrypt.compare(
        newPassword,
        user.password
    )

    if (samePassword) {
        res.status(400)
        throw new Error("New password must be different!")
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    await user.save()

    res.status(200).json({
        message: "Password Changed Successfully!"
    })
}
/// CHANGE PASSWORD FUNCTION ENDS HERE



const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '10d' })
}



const authService = {
    registerUser,
    loginUser,
    getMyProfile,
    updateProfile,
     changePassword
}

export default authService