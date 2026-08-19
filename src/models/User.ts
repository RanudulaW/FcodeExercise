import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISkill {
  name: string;
  endorsements: mongoose.Types.ObjectId[];
}

export interface IEducation {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export interface IExperience {
  title: string;
  company: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
  headline?: string;
  about?: string;
  location?: string;
  skills: ISkill[];
  education: IEducation[];
  experience: IExperience[];
  connections: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema = new Schema({
  name: { type: String, required: true },
  endorsements: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const EducationSchema: Schema = new Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String }
});

const ExperienceSchema: Schema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String }
});

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    profilePicture: { type: String, default: '' },
    headline: { type: String, default: '' },
    about: { type: String, default: '' },
    location: { type: String, default: '' },
    skills: { type: [SkillSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    connections: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
