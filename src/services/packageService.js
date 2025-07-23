import Package from "../models/Package.js";
import { ERROR_CODES } from "../utils/errors/errorCodes.js";
import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
} from "../utils/errors/errors.js";
import {
  generateOTP,
  generateOTPExpires,
  isvalidMongoId,
} from "../utils/helpers.js";
import { generateToken } from "../utils/jwt.js";
import { ReferralCodeGenerator } from "../utils/RefferalCodeGenrate.js";

export default class PackageService {
  async createPackage(data) {
    try {
      const foundPackage = await this.checkExistingPackage(data.name);
      if (foundPackage) {
        throw new ConflictError(
          "Package with this name already exists.",
          ERROR_CODES.PACKAGE_CONFLICT
        );
      }

      const newPackage = await Package.create(data);
      return newPackage;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error.name === "ValidationError") {
        throw new ValidationError(
          "Package validation failed",
          ERROR_CODES.DATABASE_ERROR,
          { originalError: error.message }
        );
      }

      throw new AppError(
        "Failed to create package",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async getAllPackages() {
    try {
      const packages = await Package.find();
      return packages;
    } catch (error) {
      throw new AppError(
        "Failed to retrieve packages",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async getPackageById(packageId) {
    try {
      const isvalidId = isvalidMongoId(packageId);
      if (!isvalidId) {
        throw new ValidationError("Invalid package ID format", "packageId");
      }

      const packageData = await Package.findById(packageId);
      if (!packageData) {
        throw new NotFoundError(
          "Package not found",
          ERROR_CODES.PACKAGE_NOT_FOUND
        );
      }
      return packageData;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new AppError(
        "Failed to retrieve package",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async updatePackageById(packageId, updateData) {
    try {
      const isvalidId = isvalidMongoId(packageId);
      if (!isvalidId) {
        throw new ValidationError("Invalid package ID format", "packageId");
      }

      if (data.name) {
        const existingPackage = await this.checkExistingPackage(
          updateData.name
        );
        if (existingPackage && existingPackage._id.toString() !== packageId) {
          throw new ConflictError("Package with this name already exists.");
        }
      }

      const updatedPackage = await Package.findByIdAndUpdate(
        packageId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedPackage) {
        throw new NotFoundError(
          "Package not found",
          ERROR_CODES.PACKAGE_NOT_FOUND
        );
      }

      return updatedPackage;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new AppError(
        "Failed to update package",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async deletePackageById(packageId) {
    try {
      const isvalidId = isvalidMongoId(packageId);
      if (!isvalidId) {
        throw new ValidationError("Invalid package ID format", "packageId");
      }

      const deletedPackage = await Package.findByIdAndDelete(packageId);
      if (!deletedPackage) {
        throw new NotFoundError(
          "Package not found",
          ERROR_CODES.PACKAGE_NOT_FOUND
        );
      }

      return deletedPackage;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new AppError(
        "Failed to delete package",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async checkExistingPackage(name) {
    const existingPackage = await Package.findOne({ name });

    if (existingPackage) {
      throw new ConflictError("Package with this name already exists.", {
        field: "name",
        value: name,
      });
    }
    return existingPackage;
  }
}
