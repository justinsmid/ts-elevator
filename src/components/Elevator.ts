import { minOfArray } from "../Utils";

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

    constructor(floor: number, isCall: boolean = false) {
        this.floor = floor;
        this.isCall = isCall;
    }
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
        case ElevatorDirection.UP:
            const closestHigherFloorToVisit: number = minOfArray(
                elevator.floorsToVisit
                    .filter(floor => floor > elevator.currentFloor)
            );
            const closestHigherCallToAnswer: number = minOfArray(
                elevator.calls
                    .map(call => call.floor)
                    .filter(floor => floor > elevator.currentFloor)
            );

            if (closestHigherFloorToVisit < closestHigherCallToAnswer) {
                return new NextFloorResult(closestHigherFloorToVisit, false);
            } else if (closestHigherCallToAnswer < closestHigherFloorToVisit) {
                return new NextFloorResult(closestHigherCallToAnswer, true);
            }

            return null;
        case ElevatorDirection.DOWN:
            const closestLowerFloorToVisit: number = minOfArray(elevator.floorsToVisit
                .filter(floor => floor < elevator.currentFloor));

            const closestLowerCallToAnswer = minOfArray(elevator.calls
                .map(call => call.floor)
                .filter(floor => floor < elevator.currentFloor));

            if (closestLowerFloorToVisit < closestLowerCallToAnswer) {
                return new NextFloorResult(closestLowerFloorToVisit, false);
            } else if (closestLowerCallToAnswer < closestLowerFloorToVisit) {
                return new NextFloorResult(closestLowerCallToAnswer, true);
            }

            return null;
        case ElevatorDirection.STATIONARY:
            const closestReducer = (closest: number, value: number): number => {
                const distance = Math.abs(elevator.currentFloor - value);
                return distance < closest ? value : closest;
            };

            const closestFloorToVisit: number | null = (
                elevator.floorsToVisit.length > 0
                    ? elevator.floorsToVisit.reduce(closestReducer)
                    : null
            );

            const closestCallToAnswer: number | null = (
                elevator.calls.length > 0
                    ? elevator.calls
                        .map(call => call.floor)
                        .reduce(closestReducer)
                    : null
            );

            if (closestFloorToVisit !== null && closestCallToAnswer !== null) {
                if (closestFloorToVisit < closestCallToAnswer) {
                    return new NextFloorResult(closestFloorToVisit, false);
                } else if (closestCallToAnswer < closestFloorToVisit) {
                    return new NextFloorResult(closestCallToAnswer, true);
                } else {
                    throw new Error(`closestFloorToVisit and closestCallToAnswer should not be equal`);
                }
            } else if (closestFloorToVisit !== null) {
                return new NextFloorResult(closestFloorToVisit, false);
            } else if (closestCallToAnswer !== null) {
                return new NextFloorResult(closestCallToAnswer, true);
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
