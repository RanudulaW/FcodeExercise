import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'like' | 'comment' | 'connection_request' | 'connection_accepted';
  entityId?: mongoose.Types.ObjectId; // E.g., Post ID
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'connection_request', 'connection_accepted'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      // Ref can be dynamic but we'll use it contextually on frontend
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
