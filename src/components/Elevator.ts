export class Elevator {
    amountOfFloors: number;
    currentFloor: number;

    constructor(amountOfFloors: number, initialFloor: number = 0) {
        this.amountOfFloors = amountOfFloors;
        this.currentFloor = initialFloor;
    }
}
