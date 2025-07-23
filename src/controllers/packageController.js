import { asyncHandler } from "../middlewares/errorHandler.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";

export default class PackageController {
  constructor(packageService) {
    this.packageService = packageService;
  }

  createPackage = asyncHandler(async (req, res) => {
    const packageData = await this.packageService.createPackage(req.body);
    return ResponseHandler.success(
      res,
      packageData,
      "Package created successfully",
      201
    );
  });

  getAllPackages = asyncHandler(async (req, res) => {
    const packages = await this.packageService.getAllPackages();
    return ResponseHandler.success(
      res,
      packages,
      "Packages retrieved successfully"
    );
  });

  getPackageById = asyncHandler(async (req, res) => {
    const packageId = req.params.id;
    const packageData = await this.packageService.getPackageById(packageId);
    if (!packageData) {
      return ResponseHandler.error(res, "Package not found", 404);
    }
    return ResponseHandler.success(
      res,
      packageData,
      "Package retrieved successfully"
    );
  });

  updatePackageById = asyncHandler(async (req, res) => {
    const packageId = req.params.id;
    const updatedPackage = await this.packageService.updatePackageById(
      packageId,
      req.body
    );
    if (!updatedPackage) {
      return ResponseHandler.error(res, "Package not found", 404);
    }
    return ResponseHandler.success(
      res,
      updatedPackage,
      "Package updated successfully"
    );
  });

  deletePackageById = asyncHandler(async (req, res) => {
    const packageId = req.params.id;
    const deletedPackage = await this.packageService.deletePackageById(
      packageId
    );
    if (!deletedPackage) {
      return ResponseHandler.error(res, "Package not found", 404);
    }
    return ResponseHandler.success(
      res,
      deletedPackage,
      "Package deleted successfully"
    );
  });
}
