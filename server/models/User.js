const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Talent'],
      default: 'Talent',
    },
    profile: {
      headline: {
        type: String,
        default: '',
      },
      location: {
        type: String,
        default: '',
      },
      timezone: {
        type: String,
        default: '',
      },
      availability: {
        type: String,
        default: '',
      },
      portfolioUrl: {
        type: String,
        default: '',
      },
      skills: {
        type: [String],
        default: [],
      },
      interests: {
        type: [String],
        default: [],
      },
      workStyles: {
        type: [String],
        default: [],
      },
    },
    profileCompletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
