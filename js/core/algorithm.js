/**
 * Tệp: js/core/algorithm.js
 * Nhiệm vụ: Xử lý Safety Algorithm và Resource-Request Algorithm.
 */

import { isVectorLessOrEqual, validateRequestPhase1, validateRequestPhase2 } from './validator.js';

export function calculateNeedMatrix(max, allocation, n, m) {
    let need = new Array(n);
    for (let i = 0; i < n; i++) {
        need[i] = new Array(m);
        for (let j = 0; j < m; j++) {
            need[i][j] = max[i][j] - allocation[i][j];
        }
    }
    return need;
}

export function runSafetyAlgorithm(available, max, allocation, need, n, m) {
    let work = new Array(m);
    for (let j = 0; j < m; j++) {
        work[j] = available[j];
    }

    let finish = new Array(n);
    for (let i = 0; i < n; i++) {
        finish[i] = false;
    }

    let safeSequence = new Array(n);
    let safeCount = 0;
    let stepLogs = [];
    let passNumber = 1;
    let foundProcessInPass = true;

    while (safeCount < n && foundProcessInPass === true) {
        foundProcessInPass = false;

        for (let i = 0; i < n; i++) {
            if (finish[i] === false) {
                let workBefore = new Array(m);
                for (let j = 0; j < m; j++) {
                    workBefore[j] = work[j];
                }

                let canExecute = isVectorLessOrEqual(need[i], work, m);

                if (canExecute === true) {
                    for (let j = 0; j < m; j++) {
                        work[j] = work[j] + allocation[i][j];
                    }
                    finish[i] = true;
                    safeSequence[safeCount] = i;
                    safeCount = safeCount + 1;
                    foundProcessInPass = true;

                    let workAfter = new Array(m);
                    for (let j = 0; j < m; j++) {
                        workAfter[j] = work[j];
                    }

                    stepLogs.push({
                        pass: passNumber,
                        processId: i,
                        status: "SELECTED",
                        workBefore: workBefore,
                        workAfter: workAfter,
                        reason: `Need[P${i}] <= Work. P${i} chạy xong và trả tài nguyên.`
                    });
                } else {
                    stepLogs.push({
                        pass: passNumber,
                        processId: i,
                        status: "WAITING",
                        workBefore: workBefore,
                        workAfter: workBefore,
                        reason: `Need[P${i}] > Work. P${i} phải đợi.`
                    });
                }
            }
        }
        passNumber = passNumber + 1;
    }

    let isSystemSafe = true;
    let uncompletedProcesses = [];
    let uncompletedCount = 0;

    for (let i = 0; i < n; i++) {
        if (finish[i] === false) {
            isSystemSafe = false;
            uncompletedProcesses[uncompletedCount] = i;
            uncompletedCount = uncompletedCount + 1;
        }
    }

    return {
        isSafe: isSystemSafe,
        safeSequence: isSystemSafe ? safeSequence : [],
        completedCount: safeCount,
        uncompletedProcesses: uncompletedProcesses,
        finalWork: work,
        finish: finish,
        stepLogs: stepLogs
    };
}

export function processResourceRequest(processId, requestVector, currentState) {
    let n = currentState.n;
    let m = currentState.m;
    let available = currentState.available;
    let max = currentState.max;
    let allocation = currentState.allocation;
    let need = currentState.need;

    let phase1 = validateRequestPhase1(requestVector, need[processId], m);
    if (phase1.valid === false) {
        return { status: "ERROR_EXCEED_NEED", isGranted: false, explanation: phase1.reason };
    }

    let phase2 = validateRequestPhase2(requestVector, available, m);
    if (phase2.valid === false) {
        return { status: "WAIT_INSUFFICIENT_AVAILABLE", isGranted: false, explanation: phase2.reason };
    }

    // Giả lập cấp phát (Pretend Allocation)
    let backupAvailable = new Array(m);
    let backupAllocationRow = new Array(m);
    let backupNeedRow = new Array(m);

    for (let j = 0; j < m; j++) {
        backupAvailable[j] = available[j];
        backupAllocationRow[j] = allocation[processId][j];
        backupNeedRow[j] = need[processId][j];

        available[j] = available[j] - requestVector[j];
        allocation[processId][j] = allocation[processId][j] + requestVector[j];
        need[processId][j] = need[processId][j] - requestVector[j];
    }

    let safetyResult = runSafetyAlgorithm(available, max, allocation, need, n, m);

    if (safetyResult.isSafe === true) {
        return {
            status: "GRANTED_SAFE",
            isGranted: true,
            safeSequence: safetyResult.safeSequence,
            stepLogs: safetyResult.stepLogs,
            explanation: "Chấp thuận: Hệ thống duy trì Trạng thái An toàn."
        };
    } else {
        // Rollback
        for (let j = 0; j < m; j++) {
            available[j] = backupAvailable[j];
            allocation[processId][j] = backupAllocationRow[j];
            need[processId][j] = backupNeedRow[j];
        }

        let blocked = safetyResult.uncompletedProcesses.map(pid => `P${pid}`).join(", ");
        return {
            status: "DENIED_UNSAFE_ROLLBACK",
            isGranted: false,
            stepLogs: safetyResult.stepLogs,
            explanation: `Từ chối & Rollback: Cấp phát khiến hệ thống Unsafe. Các tiến trình kẹt: ${blocked}.`
        };
    }
}