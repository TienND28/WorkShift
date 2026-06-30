import { Router } from "express";

import { LocationController } from "./location.controller.js";



/** /api/locations — địa giới hành chính VN (public, dùng cho chọn khu vực) */

const router = Router();



// Danh sách tỉnh / thành phố

router.get("/provinces", LocationController.listProvinces);



// Quận / huyện theo tỉnh

router.get("/provinces/:provinceId/districts", LocationController.listDistricts);



// Phường / xã theo quận

router.get("/districts/:districtId/wards", LocationController.listWards);



export default router;

