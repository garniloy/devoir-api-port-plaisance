const bcrypt = require("bcrypt");
const User = require("../models/users");
const jwt = require("jsonwebtoken");


// REGISTER
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    
    try {
        const user = await User.create({
        name,
        email,
        password
        });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        res.status(400).json({issue : "Bad body request",
            details : error.message
        })
    }
    
};

//get all user
exports.getAll = async (req, res) => {
    try {
        const users = await User.find({}, "name email");
        /*const modifieduser = []
        users.forEach((user) => {
            modifieduser.push({name : user.name, email : user.email})
        })*/
        if (users.length === 0) {
            res.status(404).json({issue : "Database error",
                details : "no user found"
            })
        };

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
    
}

// get specific user with email
exports.getSpecificUser = async (req, res) =>{
    try {
        const email = req.params.email
        const user = await User.findOne({email}, "name email")

        if (!user) {
            res.status(404).json({issue : "Database error",
                details : "User not found"})
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

// modify user information     awit Collectioin.findByIdAndUpdate(id, updateData, { returnDocument: 'after' })   //   awit Collectioin.findOneAndUpdate({filter object}, updateData, { returnDocument: 'after' })
exports.updateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findOneAndUpdate(
            { email: req.params.email },
            updateData,
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating user",
            error: error.message
        });
    }
};


// delete a user
exports.deleteUser = async (req, res) =>{
    try {
        const user = await User.findOneAndDelete(
            {email : req.params.email}
        )

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            issues : "deleted",
            id: user._id,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating user",
            error: error.message
        });
    }
}



// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        issue: 'Authentication failed',
        details: 'Invalid email or password'
      });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        issue: 'Authentication failed',
        details: 'Invalid email or password'
      });
    }
    
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.APP_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,   // JS cannot read this cookie — XSS protection
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24h in ms
    });

    res.status(200).json({success : true,
        user_name : user.name,
        user_email : user.email
    });

  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

