import { maxOfArray, minOfArray } from "../Utils";

export enum ElevatorDirection {
    UP = "up",
    DOWN = "down",
    STATIONARY = "stationary"
}

export interface Call {
    floor: number,
    direction: ElevatorDirection
}

// Amount of milliseconds before elevator direction is set back to stationary once the elevator has ran out of floors to visit
export const STATIONARY_TIMEOUT = 3000;

export class Elevator {
    amountOfFloors: number;
    currentFloor: number;
    floorsToVisit: number[];
    calls: Call[];
    direction: ElevatorDirection;

    constructor(amountOfFloors: number, initialFloor: number = 0, nextDirection = ElevatorDirection.STATIONARY) {
        this.amountOfFloors = amountOfFloors;
        this.currentFloor = initialFloor;
        this.direction = nextDirection;
        this.floorsToVisit = [];
        this.calls = [];
    }
}

export class NextFloorResult {
    floor: number;
    isCall: boolean;
    call?: Call;
    isCallAndFloorSelection: boolean;

    constructor(floor: number, isCall: boolean = false, call?: Call, isCallAndFloorSelection: boolean = false) {
        this.floor = floor;
        this.isCall = isCall;
        this.call = call;
        this.isCallAndFloorSelection = isCallAndFloorSelection;
    }
}

export const findCallToHighestFloor = (calls: Call[]): Call | null => {
    if (calls.length <= 0) return null;

    return calls.reduce((highest, call) => call.floor > highest.floor ? call : highest);
}

export const findCallToLowestFloor = (calls: Call[]): Call | null => {
    if (calls.length <= 0) return null;

    return calls.reduce((lowest, call) => call.floor < lowest.floor ? call : lowest);
}

export const findCallClosestToFloor = (calls: Call[], floor: number): Call | null => {
    if (calls.length <= 0) return null;

    return calls.reduce((closest, call) => Math.abs(floor - call.floor) < closest.floor ? call : closest);
}

/**
 * Function used internally by determineNextFloor that generalizes it when elevator is going either up or down.
 * @param elevator Elevator
 * @param floorComparator Function used to check whether a floor is in the current direction
 * @param callComparator Function used to check whether a floor is in the opposite direction
 */
const _determineNextFloor = (
    elevator: Elevator,
    floorComparator: ((floor: number) => boolean),
    callComparator: ((call: Call) => boolean),
    findClosestFloorInCurrentDirection: ((array: number[]) => number | null),
    findClosestFloorInOtherDirection: ((array: number[]) => number | null),
    findClosestCallInCurrentDirection: ((calls: Call[]) => Call | null),
    findClosestCallInOtherDirection: ((calls: Call[]) => Call | null)
): NextFloorResult | null => {
    const closestFloorInCurrentDirection = findClosestFloorInCurrentDirection(
        elevator.floorsToVisit
            .filter(floorComparator)
    );

    const closestCallInCurrentDirectionWithCurrentDirection = findClosestCallInCurrentDirection(
        elevator.calls
            .filter(callComparator)
            .filter(call => call.direction === elevator.direction)
    );

    const closestCallInCurrentDirection = findClosestCallInCurrentDirection(
        elevator.calls
            .filter(callComparator)
    );

    const closestCallInOtherDirectionWithCurrentDirection = findClosestCallInOtherDirection(
        elevator.calls
            .filter(call => !callComparator(call))
            .filter(call => call.direction === elevator.direction)
    );

    const closestCallInOtherDirection = findClosestCallInOtherDirection(
        elevator.calls
            .filter(call => !callComparator(call))
    );

    const closestFloorInOtherDirection = findClosestFloorInOtherDirection(
        elevator.floorsToVisit
            .filter(floor => !floorComparator(floor))
    );

    const closestCall = findCallClosestToFloor(elevator.calls, elevator.currentFloor);

    const closerFloorOperator = elevator.direction === ElevatorDirection.UP ? "<" : ">";

    if (closestFloorInCurrentDirection !== null && (closestCallInCurrentDirectionWithCurrentDirection !== null || closestCallInCurrentDirection !== null)) {
        if (closestCallInCurrentDirectionWithCurrentDirection !== null) {
            if (eval(`${closestFloorInCurrentDirection} ${closerFloorOperator} ${closestCallInCurrentDirectionWithCurrentDirection.floor}`)) {
                return new NextFloorResult(closestFloorInCurrentDirection);
            } else {
                // If the call is closer or the same distance, return it with the appropriate flags
                const callAndFloorAreSameDistance = closestCallInCurrentDirectionWithCurrentDirection.floor === closestFloorInCurrentDirection;
                return new NextFloorResult(closestCallInCurrentDirectionWithCurrentDirection.floor, true, closestCallInCurrentDirectionWithCurrentDirection, callAndFloorAreSameDistance);
            }
        } else if (closestCallInCurrentDirection !== null) {
            if (eval(`${closestFloorInCurrentDirection} ${closerFloorOperator} ${closestCallInCurrentDirection.floor}`)) {
                return new NextFloorResult(closestFloorInCurrentDirection);
            } else {
                // If the call is closer or the same distance, return it with the appropriate flags
                const callAndFloorAreSameDistance = closestCallInCurrentDirection.floor === closestFloorInCurrentDirection;
                return new NextFloorResult(closestCallInCurrentDirection.floor, true, closestCallInCurrentDirection, callAndFloorAreSameDistance);
            }
        }
    } else {
        // Else if there is either no call or no floorSelection in the current direction, return whichever there is, prioritizing calls to current direction
        if (closestCallInCurrentDirectionWithCurrentDirection !== null) return new NextFloorResult(closestCallInCurrentDirectionWithCurrentDirection.floor, true, closestCallInCurrentDirectionWithCurrentDirection);
        else if (closestCallInCurrentDirection !== null) return new NextFloorResult(closestCallInCurrentDirection.floor, true, closestCallInCurrentDirection);
        else if (closestFloorInCurrentDirection !== null) return new NextFloorResult(closestFloorInCurrentDirection);
        else {
            if (closestCallInOtherDirectionWithCurrentDirection !== null && closestFloorInOtherDirection !== null) {
                if (eval(`${closestCallInOtherDirectionWithCurrentDirection.floor} ${closerFloorOperator} ${closestFloorInCurrentDirection}`)) {
                    return new NextFloorResult(closestCallInOtherDirectionWithCurrentDirection.floor, true, closestCallInOtherDirectionWithCurrentDirection);
                } else {
                    const callAndFloorAreSameDistance = closestCallInOtherDirectionWithCurrentDirection.floor === closestFloorInOtherDirection;
                    return new NextFloorResult(closestCallInOtherDirectionWithCurrentDirection.floor, true, closestCallInOtherDirectionWithCurrentDirection, callAndFloorAreSameDistance);
                }
            } else if (closestCallInOtherDirection !== null && closestFloorInOtherDirection !== null) {
                if (eval(`${closestCallInOtherDirection.floor} ${closerFloorOperator} ${closestFloorInCurrentDirection}`)) {
                    return new NextFloorResult(closestCallInOtherDirection.floor, true, closestCallInOtherDirection);
                } else {
                    const callAndFloorAreSameDistance = closestCallInOtherDirection.floor === closestFloorInOtherDirection;
                    return new NextFloorResult(closestCallInOtherDirection.floor, true, closestCallInOtherDirection, callAndFloorAreSameDistance);
                }
            } else if (closestFloorInOtherDirection !== null) {
                return new NextFloorResult(closestFloorInOtherDirection);
                // Else if there are no calls or floorSelections in either direction, return the closest call regardless of direction
            } else if (closestCall !== null) {
                return new NextFloorResult(closestCall.floor, true, closestCall);
            }
        }
    }

    return null;
};

/**
 * Get the next floor for the elevator to move to, or null if the elevator has no more floors it needs to visit.
 * Assuming there are floors to be visited, this will return the closest floor in the current direction of the elevalor.
 * If the elevator is currently stationary, it will return the closest floor regardless of direction.
 * @param elevator Elevator
 */
export const determineNextFloor = (elevator: Elevator): NextFloorResult | null => {
    if (!hasFloorsToMoveTo(elevator)) return null;

    switch (elevator.direction) {
        case ElevatorDirection.UP:
            return _determineNextFloor(
                elevator,
                floor => floor > elevator.currentFloor,
                call => call.floor > elevator.currentFloor,
                minOfArray,
                maxOfArray,
                findCallToLowestFloor,
                findCallToHighestFloor
            );
        case ElevatorDirection.DOWN:
            return _determineNextFloor(
                elevator,
                floor => floor < elevator.currentFloor,
                call => call.floor < elevator.currentFloor,
                maxOfArray,
                minOfArray,
                findCallToHighestFloor,
                findCallToLowestFloor
            );
        case ElevatorDirection.STATIONARY:
            const closestReducer = (closest: number, value: number): number => {
                const distance = Math.abs(elevator.currentFloor - value);
                return distance < closest ? value : closest;
            };

            const closestFloorToVisit = (
                elevator.floorsToVisit.length > 0
                    ? elevator.floorsToVisit.reduce(closestReducer)
                    : null
            );

            const closestCallToAnswer = findCallClosestToFloor(elevator.calls, elevator.currentFloor);

            if (closestFloorToVisit && closestCallToAnswer) {
                if (closestFloorToVisit < closestCallToAnswer.floor) {
                    return new NextFloorResult(closestFloorToVisit);
                } else if (closestCallToAnswer.floor < closestFloorToVisit) {
                    return new NextFloorResult(closestCallToAnswer.floor, true, closestCallToAnswer);
                } else {
                    return new NextFloorResult(closestCallToAnswer.floor, true, closestCallToAnswer, true);
                }
            } else if (closestCallToAnswer) {
                return new NextFloorResult(closestCallToAnswer.floor, true, closestCallToAnswer);
            } else if (closestFloorToVisit) {
                return new NextFloorResult(closestFloorToVisit);
            } else {
                return null;
            }
        default: console.error(`Unknown elevator direction '${elevator.direction}'`)
    }

    return null;
}

export const hasFloorsToMoveTo = (elevator: Elevator): boolean => {
    return elevator.floorsToVisit.length > 0 || elevator.calls.length > 0;
}

export const hasFloorsToMoveToInCurrentDirection = (elevator: Elevator): boolean => {
    const { direction, currentFloor, floorsToVisit, calls } = elevator;

    switch (direction) {
        case ElevatorDirection.UP:
            return floorsToVisit.some(floor => floor > currentFloor) || calls.some(call => call.floor > currentFloor);
        case ElevatorDirection.DOWN:
            return floorsToVisit.some(floor => floor < currentFloor) || calls.some(call => call.floor > currentFloor);
        case ElevatorDirection.STATIONARY:
            return hasFloorsToMoveTo(elevator);
        default: return false;
    }
}

export const getOppositeDirection = (elevator: Elevator): ElevatorDirection => {
    switch (elevator.direction) {
        case ElevatorDirection.UP:
            return ElevatorDirection.DOWN;
        case ElevatorDirection.DOWN:
            return ElevatorDirection.UP;
        default:
            return elevator.direction;
    }
}
