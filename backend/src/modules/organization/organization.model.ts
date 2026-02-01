import mongoose, { Schema, Document } from 'mongoose';

export enum VerificationStatus {
  NONE = 'NONE',         // Mới tạo, chưa gửi hồ sơ xác thực
  PENDING = 'PENDING',   // Đang chờ Admin hệ thống duyệt
  VERIFIED = 'VERIFIED', // Đã được tin tưởng
  REJECTED = 'REJECTED'  // Hồ sơ không hợp lệ
}

export enum OrganizationLevel {
  LEVEL_0 = 0, // Unverified - Bị giới hạn số bài đăng
  LEVEL_1 = 1, // Cá nhân xác thực (CCCD) - Hộ kinh doanh nhỏ
  LEVEL_2 = 2  // Doanh nghiệp (GPKD) - Chuỗi, Công ty lớn
}

export interface IOrganization extends Document {
  ownerId: mongoose.Types.ObjectId; 

  // --- BRANDING ---
  name: string;
  slug: string; 
  description?: string;
  logo?: string;
  coverImage?: string;

  // --- CLASSIFICATION ---
  organizationType: mongoose.Types.ObjectId; 

  // --- LOCATION ---
  address: string;
  provinceId: mongoose.Types.ObjectId; 
  districtId: mongoose.Types.ObjectId;
  wardId: mongoose.Types.ObjectId;
  coordinates?: { 
    lat: number;
    lng: number;
  };

  // --- CONTACT (PUBLIC) ---
  contactPhone: string;
  email: string;
  website?: string;
  socialLinks?: {
    platform: 'FACEBOOK' | 'ZALO' | 'LINKEDIN';
    url: string;
  }[];

  // --- TRUST & VERIFICATION (ANTI-SCAM CORE) ---
  taxCode?: string;
  verificationStatus: VerificationStatus;
  verificationLevel: OrganizationLevel;
  verificationDocuments?: {
    type: 'LICENSE' | 'IDENTITY_CARD' | 'OTHER';
    url: string; 
    uploadedAt: Date;
  }[];
  reviewNote?: string; // Lý do Admin từ chối/ghi chú

  // --- SYSTEM ---
  isActive: boolean;
  isDeleted: boolean; 
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String },
    logo: { type: String },
    coverImage: { type: String },

    organizationType: { type: Schema.Types.ObjectId, ref: 'Industry', required: true },

    address: { type: String, required: true },
    provinceId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    districtId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    wardId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },

    contactPhone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    website: { type: String },
    socialLinks: [{
      platform: { type: String, enum: ['FACEBOOK', 'ZALO', 'LINKEDIN'], required: true },
      url: { type: String, required: true },
      _id: false
    }],

    taxCode: { type: String },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.NONE
    },
    verificationLevel: {
      type: Number,
      enum: Object.values(OrganizationLevel),
      default: OrganizationLevel.LEVEL_0
    },
    verificationDocuments: [{
      type: { type: String, enum: ['LICENSE', 'IDENTITY_CARD', 'OTHER'], required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
      _id: false
    }],
    reviewNote: { type: String },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

OrganizationSchema.index({ name: 'text', description: 'text' }); 

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
