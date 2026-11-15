/**
 * Tệp: js/core/generator.js
 * Nhiệm vụ: Sinh yêu cầu tự động (Valid, Unsafe, Invalid) và giả lập không Banker.
 */

import { isZeroVector, isVectorLessOrEqual } from './validator.js';
import { calculateNeedMatrix, runSafetyAlgorithm } from './algorithm.js';

function getRandomIntInclusive(minVal, maxVal) {
    if (maxVal <= minVal) return minVal;
    return minVal + Math.floor(Math.random() * (maxVal - minVal + 1));
}

export function generateRandomRequest(currentState, mode) {
    let n = currentState.n;
    let m = currentState.m;
    let available = currentState.available;
    let need = currentState.need;

    let activeProcesses = [];
    let activeCount = 0;
    for (let i = 0; i < n; i++) {
        if (isZeroVector(need[i], m) === false) {
            activeProcesses[activeCount] = i;
            activeCount = activeCount + 1;
        }
    }

    if (activeCount === 0) {
        let zeroReq = new Array(m);
        for (let j = 0; j < m; j++) zeroReq[j] = 0;
        return { processId: 0, requestVector: zeroReq, mode: mode };
    }

    if (mode === "VALID_RANDOM") {
        let targetPid = activeProcesses[getRandomIntInclusive(0, activeCount - 1)];
        let requestVec = new Array(m);
        for (let j = 0; j < m; j++) {
            let upperBound = need[targetPid][j];
            if (available[j] < upperBound && available[j] > 0) upperBound = available[j];
            requestVec[j] = getRandomIntInclusive(0, upperBound);
        }
        if (isZeroVector(requestVec, m)) {
            for (let j = 0; j < m; j++) {
                if (need[targetPid][j] > 0) {
                    requestVec[j] = 1;
                    break;
                }
            }
        }
        return { processId: targetPid, requestVector: requestVec, mode: mode };
    }

    if (mode === "STRESS_UNSAFE") {
        let max = currentState.max;
        let allocation = currentState.allocation;

        for (let idx = 0; idx < activeCount; idx++) {
            let pid = activeProcesses[idx];
            for (let attempt = 0; attempt < 10; attempt++) {
                let candidateReq = new Array(m);
                let equalsFullNeed = true;

                for (let j = 0; j < m; j++) {
                    let maxAllowed = need[pid][j];
                    if (available[j] < maxAllowed) maxAllowed = available[j];
                    candidateReq[j] = (attempt === 0) ? maxAllowed : getRandomIntInclusive(0, maxAllowed);
                    if (candidateReq[j] !== need[pid][j]) equalsFullNeed = false;
                }

                if (equalsFullNeed) {
                    for (let j = 0; j < m; j++) {
                        if (candidateReq[j] > 0) { candidateReq[j]--; break; }
                    }
                }

                if (isZeroVector(candidateReq, m) === false) {
                    let tempAvail = new Array(m);
                    let tempAlloc = new Array(n);
                    let tempNeed = new Array(n);

                    for (let j = 0; j < m; j++) tempAvail[j] = available[j] - candidateReq[j];
                    for (let i = 0; i < n; i++) {
                        tempAlloc[i] = new Array(m);
                        tempNeed[i] = new Array(m);
                        for (let j = 0; j < m; j++) {
                            tempAlloc[i][j] = allocation[i][j];
                            tempNeed[i][j] = need[i][j];
                        }
                    }
                    for (let j = 0; j < m; j++) {
                        tempAlloc[pid][j] += candidateReq[j];
                        tempNeed[pid][j] -= candidateReq[j];
                    }

                    let checkResult = runSafetyAlgorithm(tempAvail, max, tempAlloc, tempNeed, n, m);
                    if (checkResult.isSafe === false) {
                        return { processId: pid, requestVector: candidateReq, mode: mode };
                    }
                }
            }
        }
        
        let fallbackPid = activeProcesses[0];
        let maxDrainReq = new Array(m);
        for (let j = 0; j < m; j++) {
            let limit = need[fallbackPid][j];
            if (available[j] < limit) limit = available[j];
            maxDrainReq[j] = limit;
        }
        return { processId: fallbackPid, requestVector: maxDrainReq, mode: mode };
    }

    if (mode === "INVALID_EXCEED") {
        let targetPid = activeProcesses[getRandomIntInclusive(0, activeCount - 1)];
        let invalidReq = new Array(m);
        for (let j = 0; j < m; j++) {
            let baseLimit = need[targetPid][j];
            if (available[j] < baseLimit) baseLimit = available[j];
            invalidReq[j] = getRandomIntInclusive(0, baseLimit);
        }
        
        let targetRes = getRandomIntInclusive(0, m - 1);
        let exceedType = getRandomIntInclusive(0, 1);
        
        if (exceedType === 1 && need[targetPid][targetRes] > available[targetRes]) {
            invalidReq[targetRes] = available[targetRes] + 1;
        } else {
            invalidReq[targetRes] = need[targetPid][targetRes] + 1;
        }
        return { processId: targetPid, requestVector: invalidReq, mode: mode };
    }
}