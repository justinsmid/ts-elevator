import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { arrayOfLength } from '../Utils';
import { Elevator, ElevatorDirection, determineNextFloor, STATIONARY_TIMEOUT, getOppositeDirection, NextFloorResult, hasFloorsToMoveTo } from './Elevator';
import './Elevator.scss';

interface Props {
    amountOfFloors: number
};

export const ElevatorShaft: React.FC<Props> = ({ amountOfFloors }) => {
    const [elevator, setElevator] = useState<Elevator>(() => new Elevator(amountOfFloors));

    console.log(elevator);

    useEffect(() => {
        const moveElevatorInterval = window.setInterval(() => attemptToMoveElevator(elevator), 3000);
        return () => window.clearInterval(moveElevatorInterval);
    }, [elevator]);

    const attemptToMoveElevator = (elevator: Elevator) => {
        const nextFloorResult = determineNextFloor(elevator);

        if (nextFloorResult === null) {
            if (elevator.direction !== ElevatorDirection.STATIONARY) {
                if (hasFloorsToMoveTo(elevator)) {
                    // When no floor to visit was found, but there are still floors to be visited, change the elevator's direction and try to move again
                    const newElevator: Elevator = {
                        ...elevator,
                        direction: getOppositeDirection(elevator)
                    };

                    setElevator(newElevator);
                    attemptToMoveElevator(newElevator);
                } else {
                    // Else if there really are no more floors to visit, make the elevator become stationary after a given timeout
                    setTimeout(() => {
                        setElevator({
                            ...elevator,
                            direction: ElevatorDirection.STATIONARY
                        });
                    }, STATIONARY_TIMEOUT);
                }
            }
            return;
        }

        const { floor: nextFloor } = nextFloorResult;

        const directionFromCurrentFloor: ElevatorDirection = (
            nextFloor > elevator.currentFloor
                ? ElevatorDirection.UP
                : nextFloor < elevator.currentFloor
                    ? ElevatorDirection.DOWN
                    : ElevatorDirection.STATIONARY
        );

        // TODO: Figure out whether always setting direction here is correct
        const newElevator = {
            ...elevator,
            direction: directionFromCurrentFloor,
            currentFloor: nextFloor,
        };

        if (nextFloorResult.isCall) {
            newElevator.calls = newElevator.calls.filter(call => call.floor !== nextFloor);
        } else {
            newElevator.floorsToVisit = newElevator.floorsToVisit.filter(floor => floor !== nextFloor)
        }

        setElevator(newElevator);
    };

    const handleFloorButtonClick = (e: React.MouseEvent, floorNr: number) => {
        if (floorNr === elevator.currentFloor) return; // The elevator does not need to move when the current floor's button is pressed

        setElevator({
            ...elevator,
            floorsToVisit: [...elevator.floorsToVisit, floorNr]
        });
    };

    const handleCallButtonClick = (e: React.MouseEvent, floorNr: number, direction: ElevatorDirection) => {
        const callElevator = () => {
            setElevator({
                ...elevator,
                calls: [...elevator.calls, {floor: floorNr, direction}]
            });
        };

        if (floorNr === elevator.currentFloor) {
            if (hasFloorsToMoveTo(elevator)) {
                callElevator();
            } else {
                setElevator({
                    ...elevator,
                    direction
                });
            }
        } else {
            callElevator();
        }
    };

    return (
        <div className="elevator">
            {arrayOfLength(amountOfFloors).map((_, floorNr) => {
                const elevatorPresent = elevator.currentFloor === floorNr;

                return (
                    <div key={`floor-${floorNr}`} className="floor-container">
                        <div className="call-buttons">
                            <ArrowDropUp className="btn" onClick={e => handleCallButtonClick(e, floorNr, ElevatorDirection.UP)} />
                            <ArrowDropDown className="btn" onClick={e => handleCallButtonClick(e, floorNr, ElevatorDirection.DOWN)} />
                        </div>
                        {elevatorPresent
                            ? <ElevatorAtFloor key={floorNr} elevator={elevator} handleFloorButtonClick={handleFloorButtonClick} />
                            : <Floor key={floorNr} number={floorNr} />}
                    </div>
                );
            })}
        </div>
    );
};

interface FloorProps {
    number: number,
    elevatorPresent?: boolean
};

const Floor: React.FC<FloorProps> = ({ number, elevatorPresent = false, children }) => {
    return (
        <div className={`floor ${elevatorPresent ? 'current' : ''}`}>
            <p className="number">{number}</p>
            {children}
        </div>
    );
};

interface ElevatorAtFloorProps {
    elevator: Elevator,
    handleFloorButtonClick: (e: React.MouseEvent, floorNr: number) => void
}

const ElevatorAtFloor: React.FC<ElevatorAtFloorProps> = ({ elevator: { currentFloor, amountOfFloors }, handleFloorButtonClick }) => {
    return (
        <Floor number={currentFloor} elevatorPresent={true}>
            <div className="floor-buttons">
                {arrayOfLength(amountOfFloors).map((_, floorNr) => (
                    <p
                        key={`button-${floorNr}`}
                        className={`${floorNr === currentFloor ? 'current' : ''}`}
                        onClick={e => handleFloorButtonClick(e, floorNr)}
                    >
                        {floorNr}
                    </p>
                ))}
            </div>
        </Floor>
    );
};
