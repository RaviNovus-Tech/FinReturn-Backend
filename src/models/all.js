// // models/User.js
// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   fullName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true
//   },
//   phone: {
//     type: String,
//     required: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   walletAddress: {
//     type: String,
//     required: true
//   },
//   referralCode: {
//     type: String,
//     unique: true,
//     sparse: true
//   },
//   referredBy: {
//     type: String, // referral code of referrer
//     default: null
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   role: {
//     type: String,
//     enum: ['user', 'admin'],
//     default: 'user'
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('User', userSchema);

// // models/Package.js
// import mongoose from 'mongoose';

// const packageSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   duration: {
//     type: Number, // in days
//     required: true
//   },
//   roiPercentage: {
//     type: Number,
//     required: true
//   },
//   roiCycle: {
//     type: String,
//     enum: ['daily', 'weekly', 'monthly'],
//     default: 'daily'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('Package', packageSchema);

// // models/Investment.js
// import mongoose from 'mongoose';

// const investmentSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   packageId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Package',
//     required: true
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   duration: {
//     type: Number, // in days
//     required: true
//   },
//   roiPercentage: {
//     type: Number,
//     required: true
//   },
//   roiCycle: {
//     type: String,
//     enum: ['daily', 'weekly', 'monthly'],
//     required: true
//   },
//   paymentProof: {
//     type: String, // file path or URL
//     default: null
//   },
//   transactionId: {
//     type: String,
//     default: null
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'active', 'completed', 'cancelled'],
//     default: 'pending'
//   },
//   startDate: {
//     type: Date,
//     default: null
//   },
//   endDate: {
//     type: Date,
//     default: null
//   },
//   totalEarned: {
//     type: Number,
//     default: 0
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('Investment', investmentSchema);

// // models/ROIHistory.js
// import mongoose from 'mongoose';

// const roiHistorySchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   investmentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Investment',
//     required: true
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   date: {
//     type: Date,
//     default: Date.now
//   },
//   status: {
//     type: String,
//     enum: ['credited', 'pending'],
//     default: 'credited'
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('ROIHistory', roiHistorySchema);

// // models/ReferralEarnings.js
// import mongoose from 'mongoose';

// const referralEarningsSchema = new mongoose.Schema({
//   referrerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   referredUserId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   investmentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Investment',
//     required: true
//   },
//   commissionAmount: {
//     type: Number,
//     required: true
//   },
//   commissionPercentage: {
//     type: Number,
//     default: 10
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'paid'],
//     default: 'pending'
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('ReferralEarnings', referralEarningsSchema);

// // models/Message.js
// import mongoose from 'mongoose';

// const messageSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   message: {
//     type: String,
//     required: true
//   },
//   reply: {
//     type: String,
//     default: null
//   },
//   isRead: {
//     type: Boolean,
//     default: false
//   },
//   isReplied: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('Message', messageSchema);

// // models/Withdrawal.js
// import mongoose from 'mongoose';

// const withdrawalSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   walletAddress: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'processing', 'completed', 'cancelled'],
//     default: 'pending'
//   },
//   transactionId: {
//     type: String,
//     default: null
//   },
//   processedAt: {
//     type: Date,
//     default: null
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('Withdrawal', withdrawalSchema);

// // models/Announcement.js
// import mongoose from 'mongoose';

// const announcementSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   content: {
//     type: String,
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('Announcement', announcementSchema);

// // models/Settings.js
// import mongoose from 'mongoose';

// const settingsSchema = new mongoose.Schema({
//   key: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   value: {
//     type: mongoose.Schema.Types.Mixed,
//     required: true
//   },
//   description: {
//     type: String,
//     default: null
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('Settings', settingsSchema);

// // models/index.js
// import User from './User.js';
// import Package from './Package.js';
// import Investment from './Investment.js';
// import ROIHistory from './ROIHistory.js';
// import ReferralEarnings from './ReferralEarnings.js';
// import Message from './Message.js';
// import Withdrawal from './Withdrawal.js';
// import Announcement from './Announcement.js';
// import Settings from './Settings.js';

// // Export all models
// export {
//   User,
//   Package,
//   Investment,
//   ROIHistory,
//   ReferralEarnings,
//   Message,
//   Withdrawal,
//   Announcement,
//   Settings
// };

// // config/database.js
// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI);
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// };

// export default connectDB;

// // Usage Example in a controller file:
// // controllers/userController.js
// import { User, Investment, ROIHistory } from '../models/index.js';

// export const createUser = async (req, res) => {
//   try {
//     const { fullName, email, phone, password, walletAddress, referralCode } = req.body;

//     const newUser = new User({
//       fullName,
//       email,
//       phone,
//       password,
//       walletAddress,
//       referralCode
//     });

//     await newUser.save();
//     res.status(201).json({ message: 'User created successfully', user: newUser });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// export const getUserDashboard = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId);
//     const investments = await Investment.find({ userId }).populate('packageId');
//     const roiHistory = await ROIHistory.find({ userId }).sort({ date: -1 });

//     res.json({
//       user,
//       investments,
//       roiHistory
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // File structure:
// /*
// project/
// ├── models/
// │   ├── User.js
// │   ├── Package.js
// │   ├── Investment.js
// │   ├── ROIHistory.js
// │   ├── ReferralEarnings.js
// │   ├── Message.js
// │   ├── Withdrawal.js
// │   ├── Announcement.js
// │   ├── Settings.js
// │   └── index.js
// ├── config/
// │   └── database.js
// ├── controllers/
// │   └── userController.js
// └── package.json
// */

// // package.json - Make sure to add "type": "module"
// /*
// {
//   "type": "module",
//   "dependencies": {
//     "mongoose": "^7.0.0",
//     "express": "^4.18.0"
//   }
// }
// */
