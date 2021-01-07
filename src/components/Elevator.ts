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
    floorsToVisit: number[]; // Floors the elevator is currently moving to
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
 * Get the next floor for the elevator to move to, or null if the elevator has no more floors it needs to visit.
 * Assuming there are floors to be visited, this will return the closest floor in the current direction of the elevalor.
 * If the elevator is currently stationary, it will return the closest floor regardless of direction.
 * @param elevator Elevator
 */
export const determineNextFloor = (elevator: Elevator): NextFloorResult | null => {
    if (!hasFloorsToMoveTo(elevator)) return null;

    // TODO: Try to make this function less ugly
    switch (elevator.direction) {
        case ElevatorDirection.UP: {
            const closestHigherFloorToVisit = minOfArray(
                elevator.floorsToVisit
                    .filter(floor => floor > elevator.currentFloor)
            );
            const closestHigherCallToAnswer = findCallToLowestFloor(
                elevator.calls
                    .filter(call => call.floor > elevator.currentFloor)
                    .filter(call => call.direction === elevator.direction)
            );

            const closestLowerCallInCurrentDirectionToAnswer = findCallToHighestFloor(
                elevator.calls
                    .filter(call => call.floor < elevator.currentFloor)
                    .filter(call => call.direction === elevator.direction)
            );

            const closestLowerCallToAnswer = findCallToHighestFloor(
                elevator.calls
                    .filter(call => call.floor < elevator.currentFloor)
            );

            const closestCallToAnswer = findCallClosestToFloor(elevator.calls, elevator.currentFloor);

            if (closestHigherFloorToVisit !== null && closestHigherCallToAnswer !== null) {
                if (closestHigherFloorToVisit < closestHigherCallToAnswer.floor) {
                    return new NextFloorResult(closestHigherFloorToVisit, false);
                } else if (closestHigherCallToAnswer.floor < closestHigherFloorToVisit) {
                    return new NextFloorResult(closestHigherCallToAnswer.floor, true, closestHigherCallToAnswer);
                } else {
                    return new NextFloorResult(closestHigherCallToAnswer.floor, true, closestHigherCallToAnswer, true);
                }
            } else {
                if (closestHigherFloorToVisit !== null) return new NextFloorResult(closestHigherFloorToVisit, false);
                else if (closestHigherCallToAnswer !== null) return new NextFloorResult(closestHigherCallToAnswer.floor, true, closestHigherCallToAnswer);
                else {
                    if (closestLowerCallInCurrentDirectionToAnswer !== null) {
                        return new NextFloorResult(closestLowerCallInCurrentDirectionToAnswer.floor, true, closestLowerCallInCurrentDirectionToAnswer);
                    } else if (closestLowerCallToAnswer !== null) {
                        return new NextFloorResult(closestLowerCallToAnswer.floor, true, closestLowerCallToAnswer);
                    } else if (closestCallToAnswer !== null) {
                        return new NextFloorResult(closestCallToAnswer.floor, true, closestCallToAnswer);
                    }
                }
            }

            return null;
        }
        case ElevatorDirection.DOWN: {
            const closestLowerFloorToVisit = maxOfArray(
                elevator.floorsToVisit
                    .filter(floor => floor < elevator.currentFloor)
            );
            const closestLowerCallToAnswer = findCallToHighestFloor(
                elevator.calls
                    .filter(call => call.floor < elevator.currentFloor)
                    .filter(call => call.direction === elevator.direction)
            );

            const closestHigherCallInCurrentDirectionToAnswer = findCallToLowestFloor(
                elevator.calls
                    .filter(call => call.floor > elevator.currentFloor)
                    .filter(call => call.direction === elevator.direction)
            );

            const closestHigherCallToAnswer = findCallToLowestFloor(
                elevator.calls
                    .filter(call => call.floor > elevator.currentFloor)
            );

            const closestCallToAnswer = findCallClosestToFloor(elevator.calls, elevator.currentFloor);

            if (closestLowerFloorToVisit !== null && closestLowerCallToAnswer !== null) {
                if (closestLowerFloorToVisit > closestLowerCallToAnswer.floor) {
                    return new NextFloorResult(closestLowerFloorToVisit, false);
                } else if (closestLowerCallToAnswer.floor > closestLowerFloorToVisit) {
                    return new NextFloorResult(closestLowerCallToAnswer.floor, true, closestLowerCallToAnswer);
                } else {
                    return new NextFloorResult(closestLowerCallToAnswer.floor, true, closestLowerCallToAnswer, true);
                }
            } else {
                if (closestLowerFloorToVisit !== null) return new NextFloorResult(closestLowerFloorToVisit, false);
                else if (closestLowerCallToAnswer !== null) return new NextFloorResult(closestLowerCallToAnswer.floor, true, closestLowerCallToAnswer);
                else {
                    if (closestHigherCallInCurrentDirectionToAnswer !== null) {
                        return new NextFloorResult(closestHigherCallInCurrentDirectionToAnswer.floor, true, closestHigherCallInCurrentDirectionToAnswer);
                    } else if (closestHigherCallToAnswer !== null) {
                        return new NextFloorResult(closestHigherCallToAnswer.floor, true, closestHigherCallToAnswer);
                    } else if (closestCallToAnswer !== null) {
                        return new NextFloorResult(closestCallToAnswer.floor, true, closestCallToAnswer);
                    }
                }
            }

            return null;
        }
        case ElevatorDirection.STATIONARY: {
            const closestReducer = (closest: number, value: number): number => {
                const distance = Math.abs(elevator.currentFloor - value);
                return distance < closest ? value : closest;
            };

            const closestFloorToVisit: number | null = (
                elevator.floorsToVisit.length > 0
                    ? elevator.floorsToVisit.reduce(closestReducer)
                    : null
            );

            const closestCallToAnswer: Call | null = findCallClosestToFloor(elevator.calls, elevator.currentFloor);

            if (closestFloorToVisit !== null && closestCallToAnswer !== null) {
                if (closestFloorToVisit < closestCallToAnswer.floor) {
                    return new NextFloorResult(closestFloorToVisit, false);
                } else if (closestCallToAnswer.floor < closestFloorToVisit) {
                    return new NextFloorResult(closestCallToAnswer.floor, true, closestCallToAnswer);
                } else {
                    return new NextFloorResult(closestCallToAnswer.floor, true, closestCallToAnswer, true);
                }
            } else if (closestFloorToVisit !== null) {
                return new NextFloorResult(closestFloorToVisit, false);
            } else if (closestCallToAnswer !== null) {
                return new NextFloorResult(closestCallToAnswer.floor, true, closestCallToAnswer);
            } else {
                return null;
            }
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
