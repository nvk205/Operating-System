/**
 * Tệp: js/core/validator.js
 * Nhiệm vụ: Kiểm tra tính hợp lệ của dữ liệu và so sánh vector.
 */

export function isVectorLessOrEqual(vecA, vecB, m) {
    for (let k = 0; k < m; k++) {
        if (vecA[k] > vecB[k]) {
            return false;
        }
    }
    return true;
}

export function isZeroVector(vec, m) {
    for (let k = 0; k < m; k++) {
        if (vec[k] > 0) {
            return false;
        }
    }
    return true;
}

export function validateRequestPhase1(requestVector, needRow, m) {
    let isValid = isVectorLessOrEqual(requestVector, needRow, m);
    if (isValid === false) {
        let detail = "";
        for (let k = 0; k < m; k++) {
            if (requestVector[k] > needRow[k]) {
                detail += `R${k} (xin ${requestVector[k]} > Need ${needRow[k]}), `;
            }
        }
        return { valid: false, reason: "Vượt quá nhu cầu tối đa (Need) tại: " + detail };
    }
    return { valid: true, reason: "" };
}

export function validateRequestPhase2(requestVector, available, m) {
    let isValid = isVectorLessOrEqual(requestVector, available, m);
    if (isValid === false) {
        let detail = "";
        for (let k = 0; k < m; k++) {
            if (requestVector[k] > available[k]) {
                detail += `R${k} (xin ${requestVector[k]} > Available ${available[k]}), `;
            }
        }
        return { valid: false, reason: "Không đủ tài nguyên rảnh (Available) tại: " + detail };
    }
    return { valid: true, reason: "" };
}